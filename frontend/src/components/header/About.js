import React from 'react';

const About = () => {
  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-5xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
            About Me
          </h1>
          <p className="mt-4 text-xl text-gray-600 dark:text-gray-400">
            I'm Bui Van Tuan Kiet, the developer behind this AI assistant platform.
          </p>
        </div>

        {/* Main content */}
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <h2>My Mission</h2>
          <p>
            I'm on a mission to make artificial intelligence accessible, useful, and beneficial to everyone. My platform combines cutting-edge AI models with intuitive interfaces to provide a seamless experience for users of all technical backgrounds.
          </p>
          
          <h2>Key Features</h2>
          <ul>
            <li>
              <strong>Powerful AI Chat:</strong> Engage with state-of-the-art AI models for help with coding, learning, writing, and more.
            </li>
            <li>
              <strong>Customizable Agents:</strong> Create and configure specialized AI agents tailored to your specific needs and workflows.
            </li>
            <li>
              <strong>Comprehensive Learning:</strong> Access a wide range of educational resources to expand your knowledge of AI and its applications.
            </li>
            <li>
              <strong>Multiple Services:</strong> From content creation to data analysis, my platform offers diverse services to help you achieve your goals.
            </li>
          </ul>

          <h2>My Technology</h2>
          <p>
            This platform leverages the latest advancements in large language models, machine learning, and user experience design. I continually update the models and features to ensure you have access to the most capable AI tools available.
          </p>
          
          <div className="bg-rose-50 dark:bg-rose-900/20 p-6 rounded-lg my-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">My Core Values</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-rose-600 dark:text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white">Security & Privacy</h4>
                  <p className="mt-2 text-gray-600 dark:text-gray-400">I prioritize the protection of your data and conversations with robust security measures.</p>
                </div>
              </div>
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-rose-600 dark:text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white">Innovation</h4>
                  <p className="mt-2 text-gray-600 dark:text-gray-400">I continuously push the boundaries of what's possible with AI technology.</p>
                </div>
              </div>
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-rose-600 dark:text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white">Accessibility</h4>
                  <p className="mt-2 text-gray-600 dark:text-gray-400">I design my platforms to be intuitive and accessible to users with varying levels of technical expertise.</p>
                </div>
              </div>
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-rose-600 dark:text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white">Efficiency</h4>
                  <p className="mt-2 text-gray-600 dark:text-gray-400">I strive to save you time and effort by providing fast, accurate, and helpful AI responses.</p>
                </div>
              </div>
            </div>
          </div>
          
          <h2>About Me</h2>
          <p>
            I'm Bui Van Tuan Kiet, a developer passionate about AI and its potential to solve complex problems. I created this platform to make powerful AI tools accessible to everyone. With my background in software development and interest in AI, I'm dedicated to building tools that enhance human capabilities through technology.
          </p>

          <h2>Contact Me</h2>
          <p>
            Have questions or feedback? I'd love to hear from you! Reach out to me at:
          </p>
          <ul>
            <li>Email: <a href="mailto:tuankiet2640@gmail.com" className="text-rose-600 dark:text-rose-400 hover:underline">tuankiet2640@email.com</a></li>
            {/* <li>Twitter: <a href="https://twitter.com/tuankiet2640" className="text-rose-600 dark:text-rose-400 hover:underline">@tuankiet2640</a></li> */}
            {/* <li>GitHub: <a href="https://github.com/tuankiet2640" className="text-rose-600 dark:text-rose-400 hover:underline">github.com/</a></li> */}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default About;