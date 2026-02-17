export default function NotFound() {
  return (
    <div className="p-8 text-center">
      <h1 className="text-3xl font-bold mb-2">Page not found</h1>
      <p className="text-gray-500 mb-4">
        The page you’re looking for doesn’t exist or was moved.
      </p>
      <a href="/" className="text-indigo-600 underline">
        Go back home
      </a>
    </div>
  );
}