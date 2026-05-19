import { ReportDetailPage } from '@/features/reports';

interface Props {
    params: Promise<{ id: string }>;
}

export default async function ReportDetailRoute({ params }: Props) {
    const { id } = await params;
    return <ReportDetailPage id={id} />;
}
