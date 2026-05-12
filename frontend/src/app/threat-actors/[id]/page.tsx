import { ThreatActorDetailPage } from '@/features/threat-actors';

interface Props {
    params: Promise<{ id: string }>;
}

export default async function ThreatActorDetailRoute({ params }: Props) {
    const { id } = await params;
    return <ThreatActorDetailPage id={id} />;
}
