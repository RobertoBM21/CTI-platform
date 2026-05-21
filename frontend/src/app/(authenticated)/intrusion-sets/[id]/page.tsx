import { IntrusionSetDetailPage } from '@/features/intrusion-sets';

interface Props {
    params: Promise<{ id: string }>;
}

export default async function IntrusionSetDetailRoute({ params }: Props) {
    const { id } = await params;
    return <IntrusionSetDetailPage id={id} />;
}
