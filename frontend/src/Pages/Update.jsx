// import React, { useState, useEffect } from 'react'
// import { useGetMeQuery, useUpdateAccountMutation } from '../redux/Api/userApi'
// import { useNavigate } from 'react-router-dom'

// const Update = () => {
//   const navigate = useNavigate()

//   const { data, isLoading, isError } = useGetMeQuery()
//   const [updateAccount, { isLoading: isUpdating }] = useUpdateAccountMutation()

//   const [name, setName] = useState('')
//   const [description, setDescription] = useState('')
//   const [avatarPreview, setAvatarPreview] = useState('')
//   const [avatarFile, setAvatarFile] = useState(null)

//   useEffect(() => {
//     if (data?.updateuser || data?.user) {
//       const user = data.updateuser || data.user
//       setName(user.name || '')
//       setDescription(user.description || '')
//       setAvatarPreview(user.avatar || '')
//     }
//   }, [data])

//   const handleAvatarChange = (e) => {
//     const file = e.target.files[0]
//     if (file) {
//       setAvatarFile(file)
//       setAvatarPreview(URL.createObjectURL(file))
//     }
//   }

//   const handleUpdate = async (e) => {
//     e.preventDefault()

//     const formData = new FormData()
//     formData.append('name', name)
//     formData.append('description', description)
//     if (avatarFile) {
//       formData.append('file', avatarFile)
//     }

//     try {
//       const res = await updateAccount(formData).unwrap()
//       alert(res.message)
//       navigate('/')  // or any route you want to redirect after update
//     } catch (error) {
//       console.error(error)
//       alert(error?.data?.message || 'Update failed')
//     }
//   }

//   if (isLoading) return <p>Loading...</p>
//   if (isError) return <p>Error loading user data</p>

//   return (
//     <div className="max-w-md mx-auto p-4">
//       <h2 className="text-2xl font-bold mb-4">Update Account</h2>
//       <form onSubmit={handleUpdate} className="space-y-4">
//         <div>
//           <label className="block text-sm font-semibold">Name</label>
//           <input
//             type="text"
//             value={name}
//             className="w-full px-3 py-2 border rounded"
//             onChange={(e) => setName(e.target.value)}
//             required
//           />
//         </div>

//         <div>
//           <label className="block text-sm font-semibold">Description</label>
//           <textarea
//             value={description}
//             className="w-full px-3 py-2 border rounded"
//             onChange={(e) => setDescription(e.target.value)}
//           />
//         </div>

//         <div>
//           <label className="block text-sm font-semibold">Avatar</label>
//           <input
//             type="file"
//             accept="image/*"
//             className="block mt-1"
//             onChange={handleAvatarChange}
//           />
//           {avatarPreview && (
//             <img
//               src={avatarPreview}
//               alt="Avatar Preview"
//               className="mt-2 w-24 h-24 rounded-full object-cover"
//             />
//           )}
//         </div>

//         <button
//           type="submit"
//           disabled={isUpdating}
//           className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
//         >
//           {isUpdating ? 'Updating...' : 'Update'}
//         </button>
     
//             <button
//                 type="button"
//                 onClick={() => navigate('/')}
//                 className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 m-2"
//             >
//                 Cancel
//             </button>
//         {/* delete */}
//         <button
//           type="button"
//           onClick={() => {
//             if (window.confirm('Are you sure you want to delete your account?')) {
              
//             }
//           }}
//           className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 m-5"
//           >Delete Account</button>
//       </form>
//     </div>
//   )
// }

// export default Update





import React, { useState, useEffect } from 'react'
import {
  useGetMeQuery,
  useUpdateAccountMutation,
  useDeleteAccountMutation,
} from '../redux/Api/userApi'
import { useNavigate } from 'react-router-dom'

const Update = () => {
  const navigate = useNavigate()
  const { data, isLoading, isError } = useGetMeQuery()
  const [updateAccount, { isLoading: isUpdating }] = useUpdateAccountMutation()
  const [deleteAccount, { isLoading: isDeleting }] = useDeleteAccountMutation()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [avatarPreview, setAvatarPreview] = useState('')
  const [avatarFile, setAvatarFile] = useState(null)

  useEffect(() => {
    if (data?.updateuser || data?.user) {
      const user = data.updateuser || data.user
      setName(user.name || '')
      setDescription(user.description || '')
      setAvatarPreview(user.avatar || '')
    }
  }, [data])

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setAvatarFile(file)
      setAvatarPreview(URL.createObjectURL(file))
    }
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    const formData = new FormData()
    formData.append('name', name)
    formData.append('description', description)
    if (avatarFile) formData.append('file', avatarFile)

    try {
      const res = await updateAccount(formData).unwrap()
      alert(res.message)
      navigate('/')
    } catch (error) {
      console.error(error)
      alert(error?.data?.message || 'Update failed')
    }
  }

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This cannot be undone.')) return
    try {
      const res = await deleteAccount().unwrap()
      alert(res.message)
      navigate('/login')
    } catch (err) {
      console.error(err)
      alert(err?.data?.message || 'Failed to delete account')
    }
  }

  if (isLoading) return <p className="text-center mt-10">Loading...</p>
  if (isError) return <p className="text-center text-red-500 mt-10">Error loading user data</p>

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <h2 className="text-3xl font-bold mb-6 text-center">Update Your Profile</h2>
      <form onSubmit={handleUpdate} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            type="text"
            value={name}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            value={description}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Avatar Upload */}
        <div>
          <label className="block text-sm font-medium mb-1">Avatar</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {avatarPreview && (
            <img
              src={avatarPreview}
              alt="Avatar Preview"
              className="mt-3 w-24 h-24 rounded-full object-cover border"
            />
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-center sm:justify-start">
          <button
            type="submit"
            disabled={isUpdating}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition duration-200 disabled:opacity-50"
          >
            {isUpdating ? 'Updating...' : 'Update'}
          </button>

          <button
            type="button"
            onClick={() => navigate('/')}
            className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600 transition duration-200"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleDeleteAccount}
            disabled={isDeleting}
            className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 transition duration-200 disabled:opacity-50"
          >
            {isDeleting ? 'Deleting...' : 'Delete Account'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default Update
