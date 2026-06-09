import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const MyBooks = () => {
  const [loans, setLoans] = useState([]);
  const navigate = useNavigate();

  const fetchLoans = () => {
    const token = localStorage.getItem('token');
    fetch('http://localhost:5000/api/loans', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => setLoans(Array.isArray(data) ? data : []))
    .catch(err => console.error("Error fetching items:", err));
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  const handleReturnTransaction = async (loanId) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:5000/api/return', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ loanId })
      });
      
      if (response.ok) {
        alert("📚 Book returned successfully! Thank you.");
        fetchLoans(); // Refresh the list automatically
      } else {
        alert("Failed to return book.");
      }
    } catch (error) {
      console.error("Return error:", error);
    }
  };

  const handleClearHistory = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:5000/api/loans/clear', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        alert("🎉 History cleared successfully!");
        fetchLoans();
      }
    } catch (error) {
      console.error("Error updating entries:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#003135] text-[#AFDDE5] p-6 sm:p-10 font-sans">
      <div className="max-w-5xl mx-auto">
        
        <div className="flex justify-between items-center mb-8 border-b border-[#0FA4AF]/20 pb-6">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">My Borrowed Books</h1>
            {loans.length > 0 && (
              <button 
                onClick={handleClearHistory}
                className="mt-3 text-[10px] uppercase tracking-widest bg-[#003135] text-[#0FA4AF] font-black px-3 py-1.5 rounded-lg border border-[#0FA4AF]/30 hover:bg-[#0FA4AF] hover:text-[#003135] transition-all"
              >
                🧹 Clear Returned History
              </button>
            )}
          </div>
        </div>

        {loans.length === 0 ? (
          <div className="bg-[#024950] p-12 rounded-2xl border border-[#0FA4AF]/20 text-center text-gray-400 font-medium shadow-xl">
            📭 You don't have any books checked out right now.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {loans.map((loan) => (
              <div key={loan.loan_id} className="bg-[#024950] p-6 rounded-2xl shadow-xl border border-[#0FA4AF]/20 flex justify-between items-center group">
                <div>
                  <h3 className="font-black text-lg text-white">{loan.title}</h3>
                  <p className="text-xs text-gray-300 mt-1">Borrowed on: {new Date(loan.borrowed_at).toLocaleDateString()}</p>
                  <p className="text-xs font-bold text-red-400 mt-3 flex items-center gap-1">
                    ⏰ Due Date: {new Date(loan.due_date).toLocaleDateString()}
                  </p>
                </div>
                
                <div className="flex flex-col gap-2 items-end">
                  <span className="px-3 py-1 bg-[#003135] text-yellow-400 border border-yellow-500/20 rounded-full font-black text-[10px] uppercase tracking-wider">
                    {loan.status}
                  </span>
                  {loan.status === 'issued' && (
                    <button 
                      onClick={() => handleReturnTransaction(loan.loan_id)}
                      className="text-[10px] bg-[#964734] hover:bg-[#964734]/80 text-white font-black px-4 py-2 rounded-lg uppercase tracking-widest transition-all shadow-md mt-2"
                    >
                      Return Book
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default MyBooks;