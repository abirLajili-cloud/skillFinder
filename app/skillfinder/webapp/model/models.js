sap.ui.define([
    "sap/ui/model/json/JSONModel"
], function (JSONModel) {
    "use strict";

    return {
        createAppModel: function () {
            return new JSONModel({
                authenticated: false,

                busy: false,

                currentPage: "login",

                user: {
                    username: "user@skillfinder.local",
                    password: "User123!",
                    role: ""
                },

                profile: {
                    ID: "",
                    email: "",
                    firstName: "",
                    lastName: "",
                    jobTitle: "",
                    phone: "",
                    location: "",
                    summary: ""
                },

                newSkill: {
                    name: "",
                    level: "Intermédiaire",
                    years: 0
                },

                newExperience: {
                    company: "",
                    role: "",
                    startDate: "",
                    endDate: "",
                    description: ""
                },

                newCertification: {
                    name: "",
                    issuer: "",
                    issueDate: ""
                },

                skills: [],
                experiences: [],
                certifications: [],
                searchResults: [],

                search: {
                    text: "",
                    location: "",
                    minimumYears: 0
                }
            });
        }
    };
});