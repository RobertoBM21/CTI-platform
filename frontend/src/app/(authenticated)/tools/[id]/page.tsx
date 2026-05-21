import { ToolDetailPage } from '@/features/tools';

interface Props {
    params: Promise<{ id: string }>;
}

export default async function ToolDetailRoute({ params }: Props) {
    const { id } = await params;
    return <ToolDetailPage id={id} />;
}
