import { Injectable } from '@nestjs/common';
import { CourseOfAction } from '../../../cyber/domain/entities/course-of-action.entity';
import { Identity } from '../../../cyber/domain/entities/identity.entity';
import { InfrastructureEntity } from '../../../cyber/domain/entities/infrastructure-entity.entity';
import { IntrusionSet } from '../../../cyber/domain/entities/intrusion-set.entity';
import { Location } from '../../../cyber/domain/entities/location.entity';
import { Malware } from '../../../cyber/domain/entities/malware.entity';
import { Note } from '../../../cyber/domain/entities/note.entity';
import { Opinion } from '../../../cyber/domain/entities/opinion.entity';
import { Tool } from '../../../cyber/domain/entities/tool.entity';
import { Vulnerability } from '../../../cyber/domain/entities/vulnerability.entity';
import {
    IdentityClass,
    InfrastructureType,
    MalwareType,
    OpinionValue,
    Region,
    ToolType,
} from '../../../cyber/domain/value-objects';
import { AttackPattern } from '../../../threat/domain/entities/attack-pattern.entity';
import { Campaign } from '../../../threat/domain/entities/campaign.entity';
import { Incident } from '../../../threat/domain/entities/incident.entity';
import { Indicator } from '../../../threat/domain/entities/indicator.entity';
import { ThreatActor } from '../../../threat/domain/entities/threat-actor.entity';
import {
    IndicatorType,
    IocType,
    PatternType,
    ThreatActorRole,
    ThreatActorSophistication,
    ThreatActorType,
} from '../../../threat/domain/value-objects';
import { Relationship } from '../../domain/entities/relationship.entity';
import { Sighting } from '../../domain/entities/sighting.entity';
import {
    AttackMotivation,
    RelationshipType,
    ResourceLevel,
} from '../../domain/value-objects';

export interface MappedStixObject {
    type: string;
    entity: unknown;
}

@Injectable()
export class StixMapper {
    private readonly mappers = new Map<
        string,
        (obj: Record<string, unknown>) => unknown
    >([
        ['threat-actor', (o) => this.mapThreatActor(o)],
        ['campaign', (o) => this.mapCampaign(o)],
        ['incident', (o) => this.mapIncident(o)],
        ['attack-pattern', (o) => this.mapAttackPattern(o)],
        ['indicator', (o) => this.mapIndicator(o)],
        ['malware', (o) => this.mapMalware(o)],
        ['tool', (o) => this.mapTool(o)],
        ['vulnerability', (o) => this.mapVulnerability(o)],
        ['infrastructure', (o) => this.mapInfrastructure(o)],
        ['intrusion-set', (o) => this.mapIntrusionSet(o)],
        ['identity', (o) => this.mapIdentity(o)],
        ['location', (o) => this.mapLocation(o)],
        ['course-of-action', (o) => this.mapCourseOfAction(o)],
        ['note', (o) => this.mapNote(o)],
        ['opinion', (o) => this.mapOpinion(o)],
        ['relationship', (o) => this.mapRelationship(o)],
        ['sighting', (o) => this.mapSighting(o)],
    ]);

    map(stixObject: Record<string, unknown>): MappedStixObject | null {
        const type = stixObject.type as string;
        const mapper = this.mappers.get(type);
        if (!mapper) return null;
        return { type, entity: mapper(stixObject) };
    }

    private commonProps(o: Record<string, unknown>) {
        return {
            id: o.id as string,
            description: o.description as string | undefined,
            confidence: o.confidence as number | undefined,
            revoked: o.revoked as boolean | undefined,
            externalReferences: this.mapExternalReferences(o),
            createdAt: o.created ? new Date(o.created as string) : undefined,
            updatedAt: o.modified ? new Date(o.modified as string) : undefined,
        };
    }

    private mapExternalReferences(o: Record<string, unknown>) {
        const refs = o.external_references as
            | Record<string, unknown>[]
            | undefined;
        if (!refs) return undefined;
        return refs.map((r) => ({
            sourceName: r.source_name as string,
            description: r.description as string | undefined,
            externalId: r.external_id as string | undefined,
            url: r.url as string | undefined,
        }));
    }

    private asEnumValue<T extends string>(
        value: unknown,
        enumObject: Record<string, T>,
    ): T | undefined {
        if (typeof value !== 'string') {
            return undefined;
        }

        return Object.values(enumObject).includes(value as T)
            ? (value as T)
            : undefined;
    }

    private asEnumArray<T extends string>(
        value: unknown,
        enumObject: Record<string, T>,
    ): T[] | undefined {
        if (!Array.isArray(value)) {
            return undefined;
        }

        return value
            .filter((item): item is string => typeof item === 'string')
            .filter((item): item is T =>
                Object.values(enumObject).includes(item as T),
            );
    }

    private asEnumList<T extends string>(
        singular: unknown,
        plural: unknown,
        enumObject: Record<string, T>,
    ): T[] | undefined {
        const singleValue = this.asEnumValue(singular, enumObject);
        if (singleValue) {
            return [singleValue];
        }

        return this.asEnumArray(plural, enumObject);
    }

    private inferIocType(pattern: unknown): IocType {
        if (typeof pattern !== 'string') {
            return IocType.OTHER;
        }

        if (pattern.includes('ipv4-addr:value')) {
            return IocType.IPV4;
        }
        if (pattern.includes('ipv6-addr:value')) {
            return IocType.IPV6;
        }
        if (pattern.includes('domain-name:value')) {
            return IocType.DOMAIN;
        }
        if (pattern.includes('url:value')) {
            return IocType.URL;
        }
        if (pattern.includes('email-addr:value')) {
            return IocType.EMAIL;
        }
        if (pattern.includes('file:name')) {
            return IocType.FILENAME;
        }

        return IocType.OTHER;
    }

    private mapThreatActor(o: Record<string, unknown>) {
        return new ThreatActor({
            ...this.commonProps(o),
            name: o.name as string,
            threatActorTypes: this.asEnumArray(
                o.threat_actor_types,
                ThreatActorType,
            ),
            aliases: o.aliases as string[] | undefined,
            firstSeen: o.first_seen
                ? new Date(o.first_seen as string)
                : undefined,
            lastSeen: o.last_seen ? new Date(o.last_seen as string) : undefined,
            roles: this.asEnumArray(o.roles, ThreatActorRole),
            goals: o.goals as string | undefined,
            sophistication: this.asEnumValue(
                o.sophistication,
                ThreatActorSophistication,
            ),
            resourceLevel: this.asEnumValue(o.resource_level, ResourceLevel),
            primaryMotivations: this.asEnumList(
                o.primary_motivation,
                o.primary_motivations,
                AttackMotivation,
            ),
            secondaryMotivations: this.asEnumList(
                o.secondary_motivation,
                o.secondary_motivations,
                AttackMotivation,
            ),
            personalMotivations: o.personal_motivations as string | undefined,
        });
    }

    private mapCampaign(o: Record<string, unknown>) {
        return new Campaign({
            ...this.commonProps(o),
            name: o.name as string,
            aliases: o.aliases as string[] | undefined,
            firstSeen: o.first_seen
                ? new Date(o.first_seen as string)
                : undefined,
            lastSeen: o.last_seen ? new Date(o.last_seen as string) : undefined,
            objective: o.objective as string | undefined,
            primaryMotivations: this.asEnumList(
                o.primary_motivation,
                o.primary_motivations,
                AttackMotivation,
            ),
            secondaryMotivations: this.asEnumList(
                o.secondary_motivation,
                o.secondary_motivations,
                AttackMotivation,
            ),
        });
    }

    private mapIncident(o: Record<string, unknown>) {
        return new Incident({
            ...this.commonProps(o),
            name: o.name as string,
            firstSeen: o.first_seen
                ? new Date(o.first_seen as string)
                : undefined,
            lastSeen: o.last_seen ? new Date(o.last_seen as string) : undefined,
            objective: o.objective as string | undefined,
        });
    }

    private mapAttackPattern(o: Record<string, unknown>) {
        return new AttackPattern({
            ...this.commonProps(o),
            name: o.name as string,
            aliases: o.aliases as string[] | undefined,
        });
    }

    private mapIndicator(o: Record<string, unknown>) {
        return new Indicator({
            ...this.commonProps(o),
            name: o.name as string | undefined,
            type: this.inferIocType(o.pattern),
            value: o.pattern as string,
            indicatorTypes: this.asEnumArray(o.indicator_types, IndicatorType),
            pattern: o.pattern as string | undefined,
            patternType: this.asEnumValue(o.pattern_type, PatternType),
            patternVersion: o.pattern_version as string | undefined,
            validFrom: o.valid_from
                ? new Date(o.valid_from as string)
                : undefined,
            validUntil: o.valid_until
                ? new Date(o.valid_until as string)
                : undefined,
            killChainPhases: this.mapKillChainPhases(o),
        });
    }

    private mapMalware(o: Record<string, unknown>) {
        return new Malware({
            ...this.commonProps(o),
            name: o.name as string,
            malwareTypes: this.asEnumArray(o.malware_types, MalwareType),
            isFamily: (o.is_family as boolean | undefined) ?? false,
            killChainPhases: this.mapKillChainPhases(o),
            aliases: o.aliases as string[] | undefined,
            firstSeen: o.first_seen
                ? new Date(o.first_seen as string)
                : undefined,
            lastSeen: o.last_seen ? new Date(o.last_seen as string) : undefined,
            operatingSystemRefs: o.operating_system_refs as
                | string[]
                | undefined,
            architectureExecutionEnvs: o.architecture_execution_envs as
                | string[]
                | undefined,
            capabilities: o.capabilities as string[] | undefined,
        });
    }

    private mapTool(o: Record<string, unknown>) {
        return new Tool({
            ...this.commonProps(o),
            name: o.name as string,
            toolTypes: this.asEnumArray(o.tool_types, ToolType),
            killChainPhases: this.mapKillChainPhases(o),
            toolVersion: o.tool_version as string | undefined,
            aliases: o.aliases as string[] | undefined,
        });
    }

    private mapVulnerability(o: Record<string, unknown>) {
        return new Vulnerability({
            ...this.commonProps(o),
            name: o.name as string,
        });
    }

    private mapInfrastructure(o: Record<string, unknown>) {
        return new InfrastructureEntity({
            ...this.commonProps(o),
            name: o.name as string,
            infrastructureTypes: this.asEnumArray(
                o.infrastructure_types,
                InfrastructureType,
            ),
            killChainPhases: this.mapKillChainPhases(o),
            aliases: o.aliases as string[] | undefined,
            firstSeen: o.first_seen
                ? new Date(o.first_seen as string)
                : undefined,
            lastSeen: o.last_seen ? new Date(o.last_seen as string) : undefined,
        });
    }

    private mapIntrusionSet(o: Record<string, unknown>) {
        return new IntrusionSet({
            ...this.commonProps(o),
            name: o.name as string,
            aliases: o.aliases as string[] | undefined,
            firstSeen: o.first_seen
                ? new Date(o.first_seen as string)
                : undefined,
            lastSeen: o.last_seen ? new Date(o.last_seen as string) : undefined,
            goals: o.goals as string | undefined,
            resourceLevel: this.asEnumValue(o.resource_level, ResourceLevel),
            primaryMotivations: this.asEnumList(
                o.primary_motivation,
                o.primary_motivations,
                AttackMotivation,
            ),
            secondaryMotivations: this.asEnumList(
                o.secondary_motivation,
                o.secondary_motivations,
                AttackMotivation,
            ),
        });
    }

    private mapIdentity(o: Record<string, unknown>) {
        return new Identity({
            ...this.commonProps(o),
            name: o.name as string,
            identityClass: this.asEnumValue(o.identity_class, IdentityClass),
            sectors: o.sectors as string[] | undefined,
            contactInformation: o.contact_information as string | undefined,
            roles: o.roles as string[] | undefined,
        });
    }

    private mapLocation(o: Record<string, unknown>) {
        return new Location({
            ...this.commonProps(o),
            name: o.name as string,
            latitude: o.latitude as number | undefined,
            longitude: o.longitude as number | undefined,
            country: o.country as string | undefined,
            region: this.asEnumValue(o.region, Region),
            administrativeArea: o.administrative_area as string | undefined,
            city: o.city as string | undefined,
            postalCode: o.postal_code as string | undefined,
        });
    }

    private mapCourseOfAction(o: Record<string, unknown>) {
        return new CourseOfAction({
            ...this.commonProps(o),
            name: o.name as string,
        });
    }

    private mapNote(o: Record<string, unknown>) {
        return new Note({
            ...this.commonProps(o),
            content: o.content as string,
            abstract: o.abstract as string | undefined,
            objectRefs: o.object_refs as string[] | undefined,
            authors: o.authors as string[] | undefined,
        });
    }

    private mapOpinion(o: Record<string, unknown>) {
        return new Opinion({
            ...this.commonProps(o),
            opinion:
                this.asEnumValue(o.opinion, OpinionValue) ??
                OpinionValue.NEUTRAL,
            objectRefs: o.object_refs as string[] | undefined,
            explanation: o.explanation as string | undefined,
            authors: o.authors as string[] | undefined,
        });
    }

    private mapRelationship(o: Record<string, unknown>) {
        return new Relationship({
            ...this.commonProps(o),
            relationshipType:
                this.asEnumValue(o.relationship_type, RelationshipType) ??
                RelationshipType.RELATED_TO,
            sourceRef: o.source_ref as string,
            targetRef: o.target_ref as string,
            startTime: o.start_time
                ? new Date(o.start_time as string)
                : undefined,
            stopTime: o.stop_time ? new Date(o.stop_time as string) : undefined,
        });
    }

    private mapSighting(o: Record<string, unknown>) {
        return new Sighting({
            ...this.commonProps(o),
            firstSeen: o.first_seen
                ? new Date(o.first_seen as string)
                : undefined,
            lastSeen: o.last_seen ? new Date(o.last_seen as string) : undefined,
            count: o.count as number | undefined,
            sightingOfRef: o.sighting_of_ref as string,
            observedDataRefs: o.observed_data_refs as string[] | undefined,
            whereSightedRefs: o.where_sighted_refs as string[] | undefined,
        });
    }

    private mapKillChainPhases(o: Record<string, unknown>) {
        const phases = o.kill_chain_phases as
            | Record<string, unknown>[]
            | undefined;
        if (!phases) return undefined;
        return phases.map((p) => ({
            killChainName: p.kill_chain_name as string,
            phaseName: p.phase_name as string,
        }));
    }
}
