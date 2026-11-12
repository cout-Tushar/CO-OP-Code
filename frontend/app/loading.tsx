export default function Loading() {
  return (
    <div className="container page-loading" role="status">
      <div className="skeleton" />
      <div className="skeleton" />
      <p>Loading your space…</p>
    </div>
  );
}
