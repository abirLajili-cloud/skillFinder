using { skillfinder as db } from '../db/schema';

@path: '/skill'
service SkillService @(requires: 'authenticated-user') {

    @restrict: [
        { grant: '*', to: 'Admin' },
        { grant: '*', to: 'User', where: 'email = $user' }
    ]
    entity Profiles as projection on db.Profiles;

    @restrict: [
        { grant: '*', to: 'Admin' },
        { grant: '*', to: 'User', where: 'profile.email = $user' }
    ]
    entity Skills as projection on db.Skills;

    @restrict: [
        { grant: '*', to: 'Admin' },
        { grant: '*', to: 'User', where: 'profile.email = $user' }
    ]
    entity Experiences as projection on db.Experiences;

    @restrict: [
        { grant: '*', to: 'Admin' },
        { grant: '*', to: 'User', where: 'profile.email = $user' }
    ]
    entity Certifications as projection on db.Certifications;
}