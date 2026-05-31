import { useEffect, useState } from 'react';
import api from '../services/api';

function MentorDashboard() {
  const [requests, setRequests] = useState([]);
  const [replyText, setReplyText] = useState({});
  const [messages, setMessages] = useState({});
  const [openRequest, setOpenRequest] = useState(null);
  const [message, setMessage] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [showConversationModal, setShowConversationModal] = useState(false);

  useEffect(() => {
    loadRequests();
  }, []);

  async function loadRequests() {
    try {
      const res = await api.get('/mentor-requests/mentor-queue');
      setRequests(res.data);
    } catch {
      setRequests([]);
    }
  }

  async function loadMessages(requestId) {
    try {
      const res = await api.get(
        `/mentor-requests/${requestId}/messages`
      );

      setMessages((prev) => ({
        ...prev,
        [requestId]: res.data
      }));
    } catch {
      console.log('Failed to load messages.');
    }
  }

  async function sendReply(requestId) {
    try {
      await api.post(
        `/mentor-requests/${requestId}/messages`,
        {
          message:
            replyText[requestId] ||
            'I received your request and will follow up soon.'
        }
      );

      setReplyText({
        ...replyText,
        [requestId]: ''
      });

      setMessage('Reply sent successfully.');

      loadRequests();
      loadMessages(requestId);
    } catch {
      setMessage('Reply failed. Backend login is required.');
    }
  }

  const sortedRequests = [...requests].sort(
    (a, b) =>
      new Date(b.created_at) -
      new Date(a.created_at)
  );

  const totalPages =
    Math.ceil(sortedRequests.length / rowsPerPage) || 1;

  const startIndex =
    (currentPage - 1) * rowsPerPage;

  const currentRequests =
    sortedRequests.slice(
      startIndex,
      startIndex + rowsPerPage
    );

  const showPagination = sortedRequests.length > 10;

  function changeRowsPerPage(e) {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1);
  }

  function openConversation(requestId) {
    setOpenRequest(requestId);
    loadMessages(requestId);
    setShowConversationModal(true);
  }

  function closeConversation() {
    setShowConversationModal(false);
    setOpenRequest(null);
  }

  return (
    <section>
      <div
        style={{
          textAlign: 'center',
          marginBottom: '2rem'
        }}
      >
        <h2>Mentor Dashboard</h2>

        <p className="muted">
          View pending PCS help requests and respond.
        </p>

        {message && (
          <p className="success">
            {message}
          </p>
        )}
      </div>

      {requests.length === 0 ? (
        <div className="card">
          <p className="muted">
            No pending requests.
          </p>
        </div>
      ) : (
        <div className="card request-table-card">
          {showPagination && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                gap: '.5rem',
                marginBottom: '1rem'
              }}
            >
              <label>
                Rows:
              </label>

              <select
                value={rowsPerPage}
                onChange={changeRowsPerPage}
                style={{
                  width: '100px'
                }}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          )}

          <table className="request-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Marine</th>
                <th>Installation</th>
                <th>Topic</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {currentRequests.map((request) => (
                <tr key={request.request_id}>
                  <td>
                    {new Date(
                      request.created_at || Date.now()
                    ).toLocaleDateString()}
                  </td>

                  <td>
                    {request.mentee_name}
                  </td>

                  <td>
                    {request.installation_name}
                  </td>

                  <td>
                    {request.message || 'PCS support'}
                  </td>

                  <td className="request-action">
                    <button
                      onClick={() =>
                        openConversation(
                          request.request_id
                        )
                      }
                    >
                      Open Conversation
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {showPagination && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '1rem',
                marginTop: '1rem'
              }}
            >
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() =>
                  setCurrentPage(currentPage - 1)
                }
              >
                Previous
              </button>

              <span>
                Page {currentPage} of {totalPages}
              </span>

              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() =>
                  setCurrentPage(currentPage + 1)
                }
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {showConversationModal && openRequest && (
        <div
          className="modal-backdrop"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0, 0, 0, 0.55)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999
          }}
        >
          <div
            className="modal-card"
            style={{
              width: '90%',
              maxWidth: '900px',
              maxHeight: '90vh',
              overflowY: 'auto',
              position: 'relative',
              padding: '1.5rem'
            }}
          >
            <button
              onClick={closeConversation}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'transparent',
                color: '#111',
                fontSize: '1.5rem',
                padding: '0.25rem 0.5rem',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              ×
            </button>

            <h3
              style={{
                textAlign: 'center',
                marginBottom: '1rem'
              }}
            >
              Conversation
            </h3>

            <div
              className="chat-container"
              style={{
                maxHeight: '450px',
                overflowY: 'auto',
                marginBottom: '1rem'
              }}
            >
              {(messages[openRequest] || []).length === 0 ? (
                <p className="muted">
                  No messages yet.
                </p>
              ) : (
                (messages[openRequest] || []).map((msg) => (
                  <div
                    key={msg.message_id}
                    className={
                      msg.sender_role === 'mentor'
                        ? 'chat-message mentor'
                        : 'chat-message mentee'
                    }
                  >
                    <p className="chat-name">
                      {msg.first_name} {msg.last_name}
                    </p>

                    <p className="chat-text">
                      {msg.message}
                    </p>

                    <p className="chat-time">
                      {new Date(
                        msg.created_at
                      ).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>

            <textarea
              placeholder="Reply to mentee..."
              value={replyText[openRequest] || ''}
              onChange={(e) =>
                setReplyText({
                  ...replyText,
                  [openRequest]: e.target.value
                })
              }
            />

            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '1rem',
                marginTop: '1rem'
              }}
            >
              <button
                onClick={() =>
                  sendReply(openRequest)
                }
              >
                Send Reply
              </button>

              <button
                className="danger"
                onClick={closeConversation}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default MentorDashboard;