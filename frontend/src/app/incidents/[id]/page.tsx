import { IncidentDetailPage } from '@/features/incidents';

interface Props {
    params: Promise<{ id: string }>;
}

export default async function IncidentDetailRoute({ params }: Props) {
    const { id } = await params;
    return <IncidentDetailPage id={id} />;
}
