import { VulnerabilityDetailPage } from '@/features/vulnerabilities';

interface Props {
    params: Promise<{ id: string }>;
}

export default async function VulnerabilityDetailRoute({ params }: Props) {
    const { id } = await params;
    return <VulnerabilityDetailPage id={id} />;
}
