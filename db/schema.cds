namespace skillfinder;

using { cuid, managed } from '@sap/cds/common';

entity Profiles : cuid, managed {
    email          : String(120) @mandatory;
    firstName      : String(60)  @mandatory;
    lastName       : String(60)  @mandatory;
    jobTitle       : String(100);
    phone          : String(30);
    location       : String(100);
    summary        : LargeString;

    skills         : Composition of many Skills
                     on skills.profile = $self;

    experiences    : Composition of many Experiences
                     on experiences.profile = $self;

    certifications : Composition of many Certifications
                     on certifications.profile = $self;
}

entity Skills : cuid, managed {
    profile : Association to Profiles;
    name    : String(100) @mandatory;
    level   : String(30);
    years   : Integer;
}

entity Experiences : cuid, managed {
    profile     : Association to Profiles;
    company     : String(120) @mandatory;
    role        : String(120) @mandatory;
    startDate   : Date;
    endDate     : Date;
    description : LargeString;
}

entity Certifications : cuid, managed {
    profile   : Association to Profiles;
    name      : String(150) @mandatory;
    issuer    : String(120);
    issueDate : Date;
}