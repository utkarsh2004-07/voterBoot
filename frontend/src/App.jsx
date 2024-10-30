import ReactDOMServer from 'react-dom/server';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Download } from 'lucide-react';
import { useEffect, useState } from 'react';

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

const VoterSlip = ({ user }) => {
  return (
    <div className="w-[600px] mx-auto bg-white p-8 rounded-lg shadow-lg">
      {/* <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Voter Details</h1>
      </div> */}

      <div className="flex justify-center mb-6">
        <img src='https://placehold.co/400'
          // src="https://5.imimg.com/data5/SELLER/Default/2023/2/IB/ZV/GH/8142647/bjp-party-flag.png"
          alt="Voter Photo"
          className="w-48 h-48 rounded-lg shadow-md img"
        />
      </div>

      <div className="space-y-4">
        <div className="flex justify-between py-2 border-b">
          <span className="font-semibold text-gray-600">Full Name:</span>
          <span className="text-gray-800">{user.FullName}</span>
        </div>
        <div className="flex justify-between py-2 border-b">
          <span className="font-semibold text-gray-600">Serial No:</span>
          <span className="text-gray-800">{user.srno}</span>
        </div>
        <div className="flex justify-between py-2 border-b">
          <span className="font-semibold text-gray-600">Age:</span>
          <span className="text-gray-800">{user.Age}</span>
        </div>
        <div className="flex justify-between py-2 border-b">
          <span className="font-semibold text-gray-600">Sex:</span>
          <span className="text-gray-800">{user.Sex}</span>
        </div>
        <div className="flex justify-between py-2 border-b">
          <span className="font-semibold text-gray-600">Card No:</span>
          <span className="text-gray-800">{user.CardNo}</span>
        </div>
        <div className="flex justify-between py-2 border-b">
          <span className="font-semibold text-gray-600">Boot No:</span>
          <span className="text-gray-800">{user.Boot}</span>
        </div>
        {user.MobileNumber && (
          <div className="flex justify-between py-2 border-b">
            <span className="font-semibold text-gray-600">Mobile No:</span>
            <span className="text-gray-800">{user.MobileNumber}</span>
          </div>
        )}
      </div>
    </div>
  );
};

const App = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [bootNoFilter, setBootNoFilter] = useState('222 Holy Family Convent High School, Junior Collage of Science & Commerce, Evershine City, Manickpur, Vasai Gr.Floor, Room No. 3, Manikpur');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const [newMobileNumber, setNewMobileNumber] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const resultsPerPage = 4;

  useEffect(() => {
    const fetchUsers = async () => {
      const response = await fetch('https://voterboot.onrender.com/api/users');
      const data = await response.json();
      setUsers(data);
    };
    fetchUsers();
  }, []);

  const handleSearch = () => {
    if (debouncedSearchTerm) {
      const results = users.filter(user =>
        user.Boot === bootNoFilter &&
        (user.FullName.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
          user.CardNo.toString().toLowerCase() === debouncedSearchTerm.toLowerCase())
      );
      setFilteredUsers(results);
      setCurrentPage(1);
    } else {
      setFilteredUsers([]);
    }
  };

  const handleAddMobile = async () => {
    if (newMobileNumber && currentUserId) {
      const response = await fetch(`https://voterboot.onrender.com/api/users/${currentUserId}/add-mobile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ MobileNumber: newMobileNumber }),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUsers((prevUsers) => prevUsers.map(user => (user._id === updatedUser._id ? updatedUser : user)));
        setNewMobileNumber('');
        setModalVisible(false);
      }
    }
  };

  // const handleDownload = (user) => {
  //   const slip = document.createElement('div');
  //   const root = document.createElement('div');
  //   root.appendChild(slip);

  //   // Render the VoterSlip component to HTML
  //   const slipHTML = `
  //     <!DOCTYPE html>
  //     <html>
  //       <head>
  //         <title>${user.FullName} - Voter Slip</title>
  //         <style>
  //           body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
  //           .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
  //           .header { text-align: center; margin-bottom: 20px; }
  //           .photo { width: 200px; height: 200px; margin: 0 auto 20px; display: block; }
  //           .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
  //           .label { font-weight: bold; color: #666; }
  //           .value { color: #333; }
  //         </style>
  //       </head>
  //       <body>
  //         ${ReactDOMServer.renderToString(<VoterSlip user={user} />)}
  //       </body>
  //     </html>
  //   `;

  //   const blob = new Blob([slipHTML], { type: 'text/html' });
  //   const url = URL.createObjectURL(blob);
  //   const link = document.createElement('a');
  //   link.href = url;
  //   link.download = `voter-slip-${user.CardNo}.html`;
  //   document.body.appendChild(link);
  //   link.click();
  //   document.body.removeChild(link);
  //   URL.revokeObjectURL(url);
  // };



  const handleDownload = async (user) => {
    const slipElement = document.createElement('div');
    slipElement.innerHTML = ReactDOMServer.renderToString(<VoterSlip user={user} />);

    slipElement.style.width = '600px';
    slipElement.style.padding = '8px';
    slipElement.style.backgroundColor = '#fff';
    document.body.appendChild(slipElement);

    // Find the image element inside the rendered HTML
    const imageElement = slipElement.querySelector('img');

    // Check if the image is loaded
    const imageLoadPromise = new Promise((resolve, reject) => {
      if (imageElement.complete) {
        resolve(); // Image is already loaded
      } else {
        imageElement.onload = () => resolve(); // Resolve when image loads
        imageElement.onerror = () => reject(new Error('Image failed to load')); // Reject if image fails to load
      }
    });

    try {
      await imageLoadPromise; // Ensure the image is loaded before proceeding

      // Generate the canvas and PDF
      const canvas = await html2canvas(slipElement, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height],
      });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`voter-slip-${user.CardNo}.pdf`);
    } catch (error) {
      console.error("Error generating PDF", error);
    } finally {
      document.body.removeChild(slipElement); // Clean up
    }
  };







  const totalResults = filteredUsers.length;
  const totalPages = Math.ceil(totalResults / resultsPerPage);
  const startIndex = (currentPage - 1) * resultsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, startIndex + resultsPerPage);

  return (
    <div className="max-w-4xl mx-auto p-0 min-h-screen mb-5" style={{
      backgroundImage: 'url("https://res.cloudinary.com/dlya5fr9x/image/upload/v1730271193/sxb89bgdetgz3nvtn5gq.jpg")',
      backgroundSize: 'contain',
      backgroundPosition: 'center',
      backgroundRepeat: "no-repeat"
    }}>
      <div className="mb-8">
        <div className="relative flex">
          {/* <input
            type="text"
            placeholder="Search users by Full Name or Card number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 transition duration-150 ease-in-out text-sm absolute"
            style={{ top: "230px" }}
          /> */}
          <input
            type='text'
            placeholder='Search users by Full Name or Card number...'
            value={searchTerm}
            className='absolute rounded p-2 w-11/12 left-1/2 transform -translate-x-1/2'
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ top: "230px" }}
          />

          <button
            onClick={handleSearch}
            className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-150 ease-in-out absolute"
            style={{ top: "280px", left: "130px" }}
          >
            Search
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {currentUsers.length > 0 ? (
          currentUsers.map(user => (
            <div
              key={user._id}
              className="bg-white absolute left-1/2 transform -translate-x-1/2 top-[350px] rounded-md shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden text-center w-full max-w-xs md:max-w-sm"
            >
              <div className="p-4">
                <h2 className="text-lg font-semibold text-gray-800">{user.FullName}</h2>
                <div className="mt-2 w-full space-y-1">
                  <div className="flex items-center justify-between px-3 py-1 bg-gray-50 rounded">
                    <span className="text-gray-600 text-sm font-medium">Age:</span>
                    <span className="text-gray-800 text-sm">{user.Age}</span>
                  </div>
                  <div className="flex items-center justify-between px-3 py-1 bg-gray-50 rounded">
                    <span className="text-gray-600 text-sm font-medium">Sex:</span>
                    <span className="text-gray-800 text-sm">{user.Sex}</span>
                  </div>
                  <div className="flex items-center justify-between px-3 py-1 bg-gray-50 rounded">
                    <span className="text-gray-600 text-sm font-medium">Card No:</span>
                    <span className="text-gray-800 text-sm">{user.CardNo}</span>
                  </div>
                  <div className="flex items-center justify-between px-3 py-1 bg-gray-50 rounded">
                    <span className="text-gray-600 text-sm font-medium">Boot No:</span>
                    <span className="text-gray-800 text-sm">{user.Boot}</span>
                  </div>
                  {user.MobileNumber ? (
                    <div className="flex items-center justify-between px-3 py-1 bg-gray-50 rounded">
                      <span className="text-gray-600 text-sm font-medium">Mobile No:</span>
                      <span className="text-gray-800 text-sm">{user.MobileNumber}</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setModalVisible(true);
                        setCurrentUserId(user._id);
                      }}
                      className="text-blue-500 text-sm"
                    >
                      Add Mobile Number
                    </button>
                  )}
                </div>
                <div className="mt-4 flex space-x-2">
                  <button
                    onClick={() => handleDownload(user)}
                    className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-150 ease-in-out text-sm"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download Slip
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : null}
      </div>

      {modalVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-lg font-bold mb-4">Add Mobile Number</h2>
            <input
              type="text"
              value={newMobileNumber}
              onChange={(e) => setNewMobileNumber(e.target.value)}
              placeholder="Enter Mobile Number"
              className="border p-2 rounded w-full mb-4"
            />
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setModalVisible(false);
                  setNewMobileNumber('');
                }}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded mr-2"
              >
                Cancel
              </button>
              <button
                onClick={handleAddMobile}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-6 flex justify-between">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="self-center">{`Page ${currentPage} of ${totalPages}`}</span>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
