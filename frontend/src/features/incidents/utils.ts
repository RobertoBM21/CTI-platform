// Re-export shared STIX utilities so existing imports inside the incidents
// feature do not need to be updated one by one.
export {
    formatDate,
    formatDateTime,
    getStixConfig,
    getStixType,
    type StixDomain,
} from '@/shared/lib/stix';
