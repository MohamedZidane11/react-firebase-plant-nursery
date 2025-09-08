import defaultImage from '../assets/nurs_empty.png';

const NurseryCard = ({ nursery }) => {
  return (
    <div className={`rounded-xl shadow-lg overflow-hidden ${nursery.featured ? 'border-2 border-orange-500' : ''}`}>
      <div className="bg-green-100 p-6 relative">
        <div className="absolute top-3 left-3">
          {nursery.discount && (
            <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              خصم {nursery.discount}%
            </span>
          )}
        </div>
        
        <div className="absolute top-3 right-3">
          {nursery.featured && (
            <div className="bg-yellow-400 text-yellow-800 text-xs font-bold px-2 py-1 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.12a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.12a1 1 0 00-1.175 0l-3.976 2.12c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.12c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
          )}
        </div>
        
        <div className="flex justify-center">
        <img
          src={nursery.image || defaultImage}
          alt={nursery.name}
          onError={(e) => {
            e.target.src = defaultImage; // Fallback if URL fails
          }}
          className="w-32 h-32 object-contain"
        />
        </div>
      </div>
      
      <div className="p-6 bg-white">
        <h3 className="text-lg font-bold text-green-800 text-center mb-2">{nursery.name}</h3>
        
        <div className="flex flex-wrap gap-2 mb-3 justify-center">
          {nursery.categories.map((category, index) => (
            <span key={index} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
              {category}
            </span>
          ))}
        </div>
        
        <div className="text-center text-sm text-gray-600 mb-4">
          {nursery.location}
        </div>
        
        <div className="flex justify-center space-x-4">
          {nursery.services.includes('consultation') && (
            <button className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.338-3.12C2.493 15.042 2 13.574 2 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </button>
          )}
          
          {nursery.services.includes('delivery') && (
            <button className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          )}
          
          {nursery.services.includes('installation') && (
            <button className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.638 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          )}
          
          {nursery.services.includes('maintenance') && (
            <button className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NurseryCard;