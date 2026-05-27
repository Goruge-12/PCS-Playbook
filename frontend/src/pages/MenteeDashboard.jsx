import { useEffect, useState } from 'react';
import api from '../services/api';

function MenteeDashboard() {
  const [requests, setRequests] = useState([]);
  const [messages, setMessages] = useState({});
  const [replyText, setReplyText] = useState({});
  const [openRequest, setOpenRequest] = useState(null);

  useEffect(() => {
    loadRequests();
  }, []);

  async function loadRequests() {
    try {
      const res = await api.get('/mentor-requests/my-requests');
      setRequests(res.data);
    } catch {
      setRequests([]);
    }
  }

  async function loadMessages(requestId) {
    try {
      const res = await api.get(`/mentor-requests/${requestId}/messages`);

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
      await api.post(`/mentor-requests/${requestId}/messages`, {
        message: replyText[requestId] || 'Following up on my PCS request.'
      });

      setReplyText({
        ...replyText,
        [requestId]: ''
      });

      loadMessages(requestId);
    } catch {
      console.log('Failed to send message.');
    }
  }

  return (
    <section>
      <div className="card">
        <h2>My Mentor Requests</h2>
      </div>

      {requests.length === 0 ? (
        <div className="card">
          <p className="muted">
            You have not submitted any mentor requests yet.
          </p>
        </div>
      ) : (
        <div className="card request-table-card">
          <table className="request-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Installation</th>
                <th>Status</th>
                <th>Message</th>
                <th>Mentor</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {[...requests]
                .sort(
                  (a, b) =>
                    new Date(b.created_at) -
                    new Date(a.created_at)
                )
                .map((request) => (
                  <tr key={request.request_id}>
                    <td>
                      {new Date(
                        request.created_at
                      ).toLocaleDateString()}
                    </td>

                    <td>{request.installation_name}</td>

                    <td>{request.status}</td>

                    <td>{request.message}</td>

                    <td>
                      {request.mentor_first_name ? (
                        <>
                          {request.mentor_first_name}{' '}
                          {request.mentor_last_name}
                          <br />
                          <span className="muted">
                            {request.mentor_email}
                          </span>
                        </>
                      ) : (
                        <span className="muted">
                          Not assigned yet
                        </span>
                      )}
                    </td>

                    <td className="request-action">
                      <button
                        onClick={() => {
                          if (openRequest === request.request_id) {
                            setOpenRequest(null);
                          } else {
                            setOpenRequest(request.request_id);
                            loadMessages(request.request_id);
                          }
                        }}
                      >
                        {openRequest === request.request_id
                          ? 'Close Conversation'
                          : 'Open Conversation'}
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {openRequest && (
        <div className="card" style={{ marginTop: '1rem' }}>
          <h4>Conversation</h4>

          <div className="chat-container">
            {(messages[openRequest] || []).length === 0 ? (
              <p className="muted">No messages yet.</p>
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
                    {new Date(msg.created_at).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>

          <textarea
            placeholder="Reply to mentor..."
            value={replyText[openRequest] || ''}
            onChange={(e) =>
              setReplyText({
                ...replyText,
                [openRequest]: e.target.value
              })
            }
          />

          <button onClick={() => sendReply(openRequest)}>
            Send Reply
          </button>
        </div>
      )}
    </section>
  );
}

export default MenteeDashboard;