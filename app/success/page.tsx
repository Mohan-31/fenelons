export default function SuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="rounded-2xl bg-white p-8 shadow text-center">
        <h1 className="text-2xl font-semibold text-green-600">
          Payment Successful
        </h1>
        <p className="mt-3 text-gray-600">
          Your order is confirmed. Please collect on your selected date.
        </p>
      </div>
    </div>
  )
}
