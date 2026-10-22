import App from "../ui";
export default async function Page({
  params,
}: {
  params: Promise<{ path: string[] }>;
}) {
  return <App path={(await params).path} />;
}
