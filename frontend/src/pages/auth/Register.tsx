export function Register() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your KM account
          </h2>
        </div>
        <form className="mt-8 space-y-6">
          <div>
            <label className="label">Username</label>
            <input className="input" type="text" placeholder="Enter username" />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" placeholder="Enter email" />
          </div>
          <div>
            <label className="label">Password</label>
            <input className="input" type="password" placeholder="Enter password" />
          </div>
          <button className="btn-primary w-full" type="submit">
            Create Account
          </button>
        </form>
      </div>
    </div>
  )
} 