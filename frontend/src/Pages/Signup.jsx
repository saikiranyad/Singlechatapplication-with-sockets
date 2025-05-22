// // import React, { useState } from 'react';
// // import { motion } from 'framer-motion';

// // const Signup = () => {
// //   const [formData, setFormData] = useState({
// //     name: '',
// //     email: '',
// //     password: '',
// //     gender: '',
// //   });

// //   const handleChange = (e) => {
// //     const { name, value } = e.target;
// //     setFormData(prev => ({ ...prev, [name]: value }));
// //   };

// //   const handleSubmit = (e) => {
// //     e.preventDefault();
// //     console.log('Signup Data:', formData);
// //     // Add your signup logic here
// //   };

// //   return (
// //     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 p-4">
// //       <motion.div
// //         className="w-full max-w-md p-8 bg-white/50 backdrop-blur-md rounded-2xl shadow-xl"
// //         initial={{ opacity: 0, y: 40 }}
// //         animate={{ opacity: 1, y: 0 }}
// //         transition={{ duration: 0.6, ease: 'easeOut' }}
// //       >
// //         <h2 className="text-3xl font-bold text-center text-blue-700 mb-6">Create Account</h2>
// //         <form onSubmit={handleSubmit} className="space-y-5">
// //           <div>
// //             <label className="block text-sm text-blue-900 mb-1 font-medium">Name</label>
// //             <motion.input
// //               whileFocus={{ scale: 1.02 }}
// //               type="text"
// //               name="name"
// //               value={formData.name}
// //               onChange={handleChange}
// //               required
// //               className="w-full px-4 py-2 rounded-lg border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
// //             />
// //           </div>
// //           <div>
// //             <label className="block text-sm text-blue-900 mb-1 font-medium">Email</label>
// //             <motion.input
// //               whileFocus={{ scale: 1.02 }}
// //               type="email"
// //               name="email"
// //               value={formData.email}
// //               onChange={handleChange}
// //               required
// //               className="w-full px-4 py-2 rounded-lg border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
// //             />
// //           </div>
// //           <div>
// //             <label className="block text-sm text-blue-900 mb-1 font-medium">Password</label>
// //             <motion.input
// //               whileFocus={{ scale: 1.02 }}
// //               type="password"
// //               name="password"
// //               value={formData.password}
// //               onChange={handleChange}
// //               required
// //               className="w-full px-4 py-2 rounded-lg border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
// //             />
// //           </div>
// //           <div>
// //             <label className="block text-sm text-blue-900 mb-1 font-medium">Gender</label>
// //             <motion.select
// //               whileFocus={{ scale: 1.02 }}
// //               name="gender"
// //               value={formData.gender}
// //               onChange={handleChange}
// //               required
// //               className="w-full px-4 py-2 rounded-lg border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
// //             >
// //               <option value="" disabled>Select your gender</option>
// //               <option value="male">Male</option>
// //               <option value="female">Female</option>
// //               <option value="other">Other</option>
// //             </motion.select>
// //           </div>
// //           <motion.button
// //             whileHover={{ scale: 1.03 }}
// //             whileTap={{ scale: 0.97 }}
// //             type="submit"
// //             className="w-full py-2 rounded-lg bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition-all"
// //           >
// //             Sign Up
// //           </motion.button>
// //         </form>
// //       </motion.div>
// //     </div>
// //   );
// // };

// // export default Signup;
// import React, { useState } from 'react';
// import { motion } from 'framer-motion';
// import { useSignupMutation } from '../redux/Api/userApi'; // adjust the path accordingly
// import { useNavigate } from 'react-router-dom';

// const Signup = () => {
//   const [formData, setFormData] = useState({
//     name: '',
//     email: '',
//     password: '',
//     gender: '',
//   });

//   const navigate = useNavigate();
//   const [signup, { isLoading, error }] = useSignupMutation();

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       // Call signup mutation with form data
//       await signup(formData).unwrap();
//       // On success, navigate to login page
//       navigate('/login');
//     } catch (err) {
//       console.error('Failed to signup:', err);
//       // optionally, show error to user here
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 p-4">
//       <motion.div
//         className="w-full max-w-md p-8 bg-white/50 backdrop-blur-md rounded-2xl shadow-xl"
//         initial={{ opacity: 0, y: 40 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.6, ease: 'easeOut' }}
//       >
//         <h2 className="text-3xl font-bold text-center text-blue-700 mb-6">Create Account</h2>
//         <form onSubmit={handleSubmit} className="space-y-5">
//           <div>
//             <label className="block text-sm text-blue-900 mb-1 font-medium">Name</label>
//             <motion.input
//               whileFocus={{ scale: 1.02 }}
//               type="text"
//               name="name"
//               value={formData.name}
//               onChange={handleChange}
//               required
//               className="w-full px-4 py-2 rounded-lg border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
//             />
//           </div>
//           <div>
//             <label className="block text-sm text-blue-900 mb-1 font-medium">Email</label>
//             <motion.input
//               whileFocus={{ scale: 1.02 }}
//               type="email"
//               name="email"
//               value={formData.email}
//               onChange={handleChange}
//               required
//               className="w-full px-4 py-2 rounded-lg border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
//             />
//           </div>
//           <div>
//             <label className="block text-sm text-blue-900 mb-1 font-medium">Password</label>
//             <motion.input
//               whileFocus={{ scale: 1.02 }}
//               type="password"
//               name="password"
//               value={formData.password}
//               onChange={handleChange}
//               required
//               className="w-full px-4 py-2 rounded-lg border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
//             />
//           </div>
//           <div>
//             <label className="block text-sm text-blue-900 mb-1 font-medium">Gender</label>
//             <motion.select
//               whileFocus={{ scale: 1.02 }}
//               name="gender"
//               value={formData.gender}
//               onChange={handleChange}
//               required
//               className="w-full px-4 py-2 rounded-lg border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
//             >
//               <option value="" disabled>Select your gender</option>
//               <option value="male">Male</option>
//               <option value="female">Female</option>
//               <option value="other">Other</option>
//             </motion.select>
//           </div>
//           <motion.button
//             whileHover={{ scale: 1.03 }}
//             whileTap={{ scale: 0.97 }}
//             type="submit"
//             disabled={isLoading}
//             className="w-full py-2 rounded-lg bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             {isLoading ? 'Signing Up...' : 'Sign Up'}
//           </motion.button>

//           {error && (
//             <p className="text-red-600 mt-2 text-center">
//               Signup failed. Please try again.
//             </p>
//           )}
//         </form>
//       </motion.div>
//     </div>
//   );
// };

// export default Signup;




import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useSignupMutation } from '../redux/Api/userApi'; // adjust path accordingly
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    gender: '',
  });

  const [avatar, setAvatar] = useState(null); // for storing file
  const navigate = useNavigate();
  const [signup, { isLoading, error }] = useSignupMutation();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setAvatar(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Use FormData for file upload
    const data = new FormData();
    data.append('name', formData.name);
    data.append('email', formData.email);
    data.append('password', formData.password);
    data.append('gender', formData.gender);
    if (avatar) {
      data.append('image', avatar);
    }

    try {
      await signup(data).unwrap();
      navigate('/login');
    } catch (err) {
      console.error('Failed to signup:', err);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 p-4">
      <motion.div
        className="w-full max-w-md p-8 bg-white/50 backdrop-blur-md rounded-2xl shadow-xl"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <h2 className="text-3xl font-bold text-center text-blue-700 mb-6">Create Account</h2>
        <form onSubmit={handleSubmit} className="space-y-5" encType="multipart/form-data">
          <div>
            <label className="block text-sm text-blue-900 mb-1 font-medium">Name</label>
            <motion.input
              whileFocus={{ scale: 1.02 }}
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-lg border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          <div>
            <label className="block text-sm text-blue-900 mb-1 font-medium">Email</label>
            <motion.input
              whileFocus={{ scale: 1.02 }}
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-lg border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          <div>
            <label className="block text-sm text-blue-900 mb-1 font-medium">Password</label>
            <motion.input
              whileFocus={{ scale: 1.02 }}
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-lg border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          <div>
            <label className="block text-sm text-blue-900 mb-1 font-medium">Gender</label>
            <motion.select
              whileFocus={{ scale: 1.02 }}
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-lg border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="" disabled>Select your gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </motion.select>
          </div>

          <div>
            <label className="block text-sm text-blue-900 mb-1 font-medium">Avatar Image</label>
            <motion.input
              whileFocus={{ scale: 1.02 }}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              name='image'
              className="w-full text-sm text-gray-600"
            />
            {avatar && (
              <img
                src={URL.createObjectURL(avatar)}
                alt="Avatar Preview"
                className="mt-2 w-20 h-20 object-cover rounded-full border border-blue-400"
              />
            )}
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={isLoading}
            className="w-full py-2 rounded-lg bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Signing Up...' : 'Sign Up'}
          </motion.button>

          {error && (
            <p className="text-red-600 mt-2 text-center">
              Signup failed. Please try again.
            </p>
          )}
        </form>
      </motion.div>
    </div>
  );
};

export default Signup;
