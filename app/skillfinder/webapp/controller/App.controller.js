sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "skillfinder/util/Api"
], function (
    Controller,
    MessageToast,
    MessageBox,
    Api
) {
    "use strict";

    return Controller.extend(
        "skillfinder.controller.App",
        {
            onInit: function () {
                this.vModel = this.getOwnerComponent().getModel("app");

                this.byId("mainApp").to(
                    this.byId("loginPage")
                );
            },

            onLogin: async function () {
                const vUsername =
                    this.vModel.getProperty("/user/username");

                const vPassword =
                    this.vModel.getProperty("/user/password");

                if (!vUsername || !vPassword) {
                    MessageBox.warning(
                        "Veuillez renseigner l’utilisateur et le mot de passe."
                    );

                    return;
                }

                this.vModel.setProperty("/busy", true);

                try {
                    Api.setCredentials(
                        vUsername,
                        vPassword
                    );

                    await Api.testConnection();

                    const vRole =
                        vUsername === "admin@skillfinder.local"
                            ? "Admin"
                            : "User";

                    this.vModel.setProperty(
                        "/user/role",
                        vRole
                    );

                    this.vModel.setProperty(
                        "/authenticated",
                        true
                    );

                    this.byId("mainApp").to(
                        this.byId("homePage")
                    );

                    if (vRole === "Admin") {
                        this.byId("mainIconTabBar").setSelectedKey(
                            "search"
                        );

                        await this.onSearch();
                    } else {
                        await this.loadCurrentProfile();
                    }

                    MessageToast.show(
                        "Connexion réussie"
                    );
                } catch (vError) {
                    Api.clearCredentials();

                    MessageBox.error(
                        "Identifiants incorrects ou service indisponible."
                    );
                } finally {
                    this.vModel.setProperty(
                        "/busy",
                        false
                    );
                }
            },

            onLogout: function () {
                Api.clearCredentials();

                this.vModel.setProperty(
                    "/authenticated",
                    false
                );

                this.vModel.setProperty(
                    "/user/role",
                    ""
                );

                this.vModel.setProperty(
                    "/profile",
                    this.createEmptyProfile()
                );

                this.vModel.setProperty("/skills", []);
                this.vModel.setProperty("/experiences", []);
                this.vModel.setProperty("/certifications", []);
                this.vModel.setProperty("/searchResults", []);

                this.byId("mainApp").to(
                    this.byId("loginPage")
                );
            },

            createEmptyProfile: function () {
                return {
                    ID: "",
                    email: this.vModel.getProperty(
                        "/user/username"
                    ),
                    firstName: "",
                    lastName: "",
                    jobTitle: "",
                    phone: "",
                    location: "",
                    summary: ""
                };
            },

            loadCurrentProfile: async function () {
                try {
                    const vResult =
                        await Api.getCurrentProfile();

                    const vProfile =
                        vResult.value &&
                        vResult.value.length > 0
                            ? vResult.value[0]
                            : this.createEmptyProfile();

                    this.vModel.setProperty(
                        "/profile",
                        {
                            ID: vProfile.ID || "",
                            email:
                                vProfile.email ||
                                this.vModel.getProperty(
                                    "/user/username"
                                ),
                            firstName:
                                vProfile.firstName || "",
                            lastName:
                                vProfile.lastName || "",
                            jobTitle:
                                vProfile.jobTitle || "",
                            phone:
                                vProfile.phone || "",
                            location:
                                vProfile.location || "",
                            summary:
                                vProfile.summary || ""
                        }
                    );

                    this.vModel.setProperty(
                        "/skills",
                        vProfile.skills || []
                    );

                    this.vModel.setProperty(
                        "/experiences",
                        vProfile.experiences || []
                    );

                    this.vModel.setProperty(
                        "/certifications",
                        vProfile.certifications || []
                    );
                } catch (vError) {
                    MessageBox.error(
                        "Impossible de charger le profil."
                    );
                }
            },

            onSaveProfile: async function () {
                const vProfile =
                    this.vModel.getProperty("/profile");

                if (
                    !vProfile.email ||
                    !vProfile.firstName ||
                    !vProfile.lastName
                ) {
                    MessageBox.warning(
                        "L’e-mail, le prénom et le nom sont obligatoires."
                    );

                    return;
                }

                const vPayload = {
                    email: vProfile.email,
                    firstName: vProfile.firstName,
                    lastName: vProfile.lastName,
                    jobTitle: vProfile.jobTitle,
                    phone: vProfile.phone,
                    location: vProfile.location,
                    summary: vProfile.summary
                };

                try {
                    if (vProfile.ID) {
                        await Api.updateProfile(
                            vProfile.ID,
                            vPayload
                        );
                    } else {
                        await Api.createProfile(
                            vPayload
                        );
                    }

                    await this.loadCurrentProfile();

                    MessageToast.show(
                        "Profil enregistré avec succès"
                    );
                } catch (vError) {
                    MessageBox.error(
                        "Erreur lors de l’enregistrement du profil."
                    );
                }
            },

            verifyProfileExists: function () {
                const vProfileId =
                    this.vModel.getProperty("/profile/ID");

                if (!vProfileId) {
                    MessageBox.warning(
                        "Enregistrez d’abord les informations du profil."
                    );

                    return false;
                }

                return true;
            },

            onAddSkill: async function () {
                if (!this.verifyProfileExists()) {
                    return;
                }

                const vSkill =
                    this.vModel.getProperty("/newSkill");

                if (!vSkill.name) {
                    MessageBox.warning(
                        "Veuillez saisir une compétence."
                    );

                    return;
                }

                const vProfileId =
                    this.vModel.getProperty("/profile/ID");

                try {
                    await Api.createSkill({
                        profile_ID: vProfileId,
                        name: vSkill.name,
                        level: vSkill.level,
                        years: Number(vSkill.years || 0)
                    });

                    this.vModel.setProperty(
                        "/newSkill",
                        {
                            name: "",
                            level: "Intermédiaire",
                            years: 0
                        }
                    );

                    await this.loadCurrentProfile();

                    MessageToast.show(
                        "Compétence ajoutée"
                    );
                } catch (vError) {
                    MessageBox.error(
                        "Impossible d’ajouter la compétence."
                    );
                }
            },

            onDeleteSkill: async function (vEvent) {
                const vContext =
                    vEvent.getSource().getBindingContext("app");

                const vSkill =
                    vContext.getObject();

                try {
                    await Api.deleteSkill(vSkill.ID);

                    await this.loadCurrentProfile();

                    MessageToast.show(
                        "Compétence supprimée"
                    );
                } catch (vError) {
                    MessageBox.error(
                        "Impossible de supprimer la compétence."
                    );
                }
            },

            onAddExperience: async function () {
                if (!this.verifyProfileExists()) {
                    return;
                }

                const vExperience =
                    this.vModel.getProperty("/newExperience");

                if (
                    !vExperience.company ||
                    !vExperience.role
                ) {
                    MessageBox.warning(
                        "L’entreprise et le rôle sont obligatoires."
                    );

                    return;
                }

                const vProfileId =
                    this.vModel.getProperty("/profile/ID");

                try {
                    await Api.createExperience({
                        profile_ID: vProfileId,
                        company: vExperience.company,
                        role: vExperience.role,
                        startDate:
                            vExperience.startDate || null,
                        endDate:
                            vExperience.endDate || null,
                        description:
                            vExperience.description
                    });

                    this.vModel.setProperty(
                        "/newExperience",
                        {
                            company: "",
                            role: "",
                            startDate: "",
                            endDate: "",
                            description: ""
                        }
                    );

                    await this.loadCurrentProfile();

                    MessageToast.show(
                        "Expérience ajoutée"
                    );
                } catch (vError) {
                    MessageBox.error(
                        "Impossible d’ajouter l’expérience."
                    );
                }
            },

            onDeleteExperience: async function (vEvent) {
                const vContext =
                    vEvent.getSource().getBindingContext("app");

                const vExperience =
                    vContext.getObject();

                try {
                    await Api.deleteExperience(
                        vExperience.ID
                    );

                    await this.loadCurrentProfile();

                    MessageToast.show(
                        "Expérience supprimée"
                    );
                } catch (vError) {
                    MessageBox.error(
                        "Impossible de supprimer l’expérience."
                    );
                }
            },

            onAddCertification: async function () {
                if (!this.verifyProfileExists()) {
                    return;
                }

                const vCertification =
                    this.vModel.getProperty(
                        "/newCertification"
                    );

                if (!vCertification.name) {
                    MessageBox.warning(
                        "Veuillez saisir le nom de la certification."
                    );

                    return;
                }

                const vProfileId =
                    this.vModel.getProperty("/profile/ID");

                try {
                    await Api.createCertification({
                        profile_ID: vProfileId,
                        name: vCertification.name,
                        issuer: vCertification.issuer,
                        issueDate:
                            vCertification.issueDate || null
                    });

                    this.vModel.setProperty(
                        "/newCertification",
                        {
                            name: "",
                            issuer: "",
                            issueDate: ""
                        }
                    );

                    await this.loadCurrentProfile();

                    MessageToast.show(
                        "Certification ajoutée"
                    );
                } catch (vError) {
                    MessageBox.error(
                        "Impossible d’ajouter la certification."
                    );
                }
            },

            onDeleteCertification: async function (
                vEvent
            ) {
                const vContext =
                    vEvent.getSource().getBindingContext("app");

                const vCertification =
                    vContext.getObject();

                try {
                    await Api.deleteCertification(
                        vCertification.ID
                    );

                    await this.loadCurrentProfile();

                    MessageToast.show(
                        "Certification supprimée"
                    );
                } catch (vError) {
                    MessageBox.error(
                        "Impossible de supprimer la certification."
                    );
                }
            },

            onSearch: async function () {
                if (
                    this.vModel.getProperty("/user/role") !==
                    "Admin"
                ) {
                    return;
                }

                try {
                    const vResponse =
                        await Api.getAllProfiles();

                    const vSearchText = (
                        this.vModel.getProperty(
                            "/search/text"
                        ) || ""
                    ).toLowerCase();

                    const vLocation = (
                        this.vModel.getProperty(
                            "/search/location"
                        ) || ""
                    ).toLowerCase();

                    const vMinimumYears = Number(
                        this.vModel.getProperty(
                            "/search/minimumYears"
                        ) || 0
                    );

                    const vResults =
                        vResponse.value.filter(
                            function (vProfile) {
                                const vSkills =
                                    vProfile.skills || [];

                                const vGeneralText = [
                                    vProfile.firstName,
                                    vProfile.lastName,
                                    vProfile.jobTitle,
                                    vProfile.location,
                                    ...vSkills.map(
                                        function (vSkill) {
                                            return vSkill.name;
                                        }
                                    )
                                ]
                                    .filter(Boolean)
                                    .join(" ")
                                    .toLowerCase();

                                const vMatchesText =
                                    !vSearchText ||
                                    vGeneralText.includes(
                                        vSearchText
                                    );

                                const vMatchesLocation =
                                    !vLocation ||
                                    (
                                        vProfile.location || ""
                                    )
                                        .toLowerCase()
                                        .includes(vLocation);

                                const vMatchesYears =
                                    vMinimumYears === 0 ||
                                    vSkills.some(
                                        function (vSkill) {
                                            return (
                                                Number(
                                                    vSkill.years ||
                                                    0
                                                ) >=
                                                vMinimumYears
                                            );
                                        }
                                    );

                                return (
                                    vMatchesText &&
                                    vMatchesLocation &&
                                    vMatchesYears
                                );
                            }
                        );

                    this.vModel.setProperty(
                        "/searchResults",
                        vResults
                    );
                } catch (vError) {
                    MessageBox.error(
                        "Impossible d’effectuer la recherche."
                    );
                }
            },

            onShowProfile: function () {
                this.byId("mainIconTabBar").setSelectedKey(
                    "profile"
                );
            },

            onShowSearch: function () {
                this.byId("mainIconTabBar").setSelectedKey(
                    "search"
                );

                this.onSearch();
            },

            onShowCV: function () {
                this.byId("mainIconTabBar").setSelectedKey(
                    "cv"
                );
            },

            onTabSelect: function (vEvent) {
                const vKey =
                    vEvent.getParameter("key");

                if (vKey === "search") {
                    this.onSearch();
                }
            },

            onPrintCV: function () {
                window.print();
            }
        }
    );
});