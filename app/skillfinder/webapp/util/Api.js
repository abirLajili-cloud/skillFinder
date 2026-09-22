sap.ui.define([], function () {
    "use strict";

    const vServiceUrl = "/skill";

    let vAuthorization = "";

    function buildHeaders() {
        return {
            "Authorization": vAuthorization,
            "Content-Type": "application/json",
            "Accept": "application/json"
        };
    }

    async function request(vPath, vOptions) {
        const vResponse = await fetch(
            vServiceUrl + vPath,
            {
                ...vOptions,
                headers: {
                    ...buildHeaders(),
                    ...(vOptions?.headers || {})
                }
            }
        );

        if (!vResponse.ok) {
            const vErrorText = await vResponse.text();

            throw new Error(
                vErrorText ||
                "Erreur durant l’appel du service SkillFinder."
            );
        }

        if (vResponse.status === 204) {
            return null;
        }

        return vResponse.json();
    }

    return {
        setCredentials: function (vUsername, vPassword) {
            vAuthorization =
                "Basic " +
                window.btoa(vUsername + ":" + vPassword);
        },

        clearCredentials: function () {
            vAuthorization = "";
        },

        testConnection: function () {
            return request("/Profiles?$top=1");
        },

        getCurrentProfile: function () {
            return request(
                "/Profiles" +
                "?$expand=skills,experiences,certifications"
            );
        },

        getAllProfiles: function () {
            return request(
                "/Profiles" +
                "?$expand=skills,experiences,certifications"
            );
        },

        createProfile: function (vProfile) {
            return request("/Profiles", {
                method: "POST",
                body: JSON.stringify(vProfile)
            });
        },

        updateProfile: function (vProfileId, vProfile) {
            return request(
                "/Profiles(" + vProfileId + ")",
                {
                    method: "PATCH",
                    body: JSON.stringify(vProfile)
                }
            );
        },

        createSkill: function (vSkill) {
            return request("/Skills", {
                method: "POST",
                body: JSON.stringify(vSkill)
            });
        },

        deleteSkill: function (vSkillId) {
            return request(
                "/Skills(" + vSkillId + ")",
                {
                    method: "DELETE"
                }
            );
        },

        createExperience: function (vExperience) {
            return request("/Experiences", {
                method: "POST",
                body: JSON.stringify(vExperience)
            });
        },

        deleteExperience: function (vExperienceId) {
            return request(
                "/Experiences(" + vExperienceId + ")",
                {
                    method: "DELETE"
                }
            );
        },

        createCertification: function (vCertification) {
            return request("/Certifications", {
                method: "POST",
                body: JSON.stringify(vCertification)
            });
        },

        deleteCertification: function (vCertificationId) {
            return request(
                "/Certifications(" + vCertificationId + ")",
                {
                    method: "DELETE"
                }
            );
        }
    };
});