import PageClient from './PageClient';

// Generate static params for build - actual data loaded client-side
export function generateStaticParams() {
  return [{ id: '1' }, { id: '2' }, { id: '3' }];
}

export default function Page({ params }: { params: { id: string } }) {
  return <PageClient />;
}
