'use client';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
    return (
        <html lang="en">
            <body className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="p-8 bg-white rounded shadow">
                    <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
                    <p className="mb-4">{error.message}</p>
                    <button onClick={() => reset()} className="px-4 py-2 bg-blue-500 text-white rounded">
                        Try again
                    </button>
                </div>
            </body>
        </html>
    );
}
