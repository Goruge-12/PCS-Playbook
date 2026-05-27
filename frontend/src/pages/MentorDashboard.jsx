import { useEffect, useState } from 'react';
import api from '../services/api';

function MentorDashboard() {
  const [requests, setRequests] = useState([]);
  const [replyText, setReplyText] = useState({});
  const [messages, setMessages] = useState({});
  const [openRequest, setOpenRequest] = useState(null);
  const [message, setMessage] = useState('');

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

  return (
    <section>

      <div className="card">
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
                        onClick={() => {

                          if (
                            openRequest ===
                            request.request_id
                          ) {

                            setOpenRequest(null);

                          } else {

                            setOpenRequest(
                              request.request_id
                            );

                            loadMessages(
                              request.request_id
                            );

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

        <div
          className="card"
          style={{ marginTop: '1rem' }}
        >

          <h4>Conversation</h4>

          <div className="chat-container">

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
            value={
              replyText[openRequest] || ''
            }
            onChange={(e) =>
              setReplyText({
                ...replyText,
                [openRequest]:
                  e.target.value
              })
            }
          />

          <button
            onClick={() =>
              sendReply(openRequest)
            }
          >
            Send Reply
          </button>

        </div>

      )}

    </section>
  );
}

export default MentorDashboard;