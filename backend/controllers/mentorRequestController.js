const pool = require('../config/db');
const { sendEmail } = require('../utils/emailService.js');

exports.createRequest = async (req, res) => {
  try {
    const { installation_id, message } = req.body;

    const mentee_user_id = req.user.user_id;

    const [users] = await pool.query(
      'SELECT first_name, last_name, email, phone, rank FROM users WHERE user_id = ?',
      [mentee_user_id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        message: 'User not found.'
      });
    }

    const mentee = users[0];
    const menteeDisplayName = `${mentee.rank} ${mentee.last_name}, ${mentee.first_name}`;

    const [mentors] = await pool.query(
      `SELECT u.user_id, u.email, u.first_name, u.last_name, u.rank
       FROM mentor_profiles mp
       JOIN users u ON mp.user_id = u.user_id
       WHERE mp.installation_id = ?
       AND mp.is_available = TRUE
       AND u.role = 'mentor'
       LIMIT 1`,
      [installation_id]
    );

    const assignedMentorId =
      mentors.length > 0 ? mentors[0].user_id : null;

    const assignedMentor =
      mentors.length > 0 ? mentors[0] : null;

    const status =
      assignedMentorId ? 'assigned' : 'pending';

    await pool.query(
      `INSERT INTO mentor_requests
      (
        mentee_user_id,
        mentor_user_id,
        installation_id,
        mentee_name,
        mentee_email,
        mentee_phone,
        mentee_rank,
        message,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        mentee_user_id,
        assignedMentorId,
        installation_id,
        menteeDisplayName,
        mentee.email,
        mentee.phone,
        mentee.rank,
        message,
        status
      ]
    );

    try {
      await sendEmail(
        mentee.email,
        'PCS Playbook Mentor Request Submitted',
        'Your mentor request was successfully submitted. You will receive an email notification when a mentor responds.'
      );

      if (assignedMentor) {
        await sendEmail(
          assignedMentor.email,
          'New PCS Playbook Mentor Request',
          `${menteeDisplayName} has requested a mentor. Please log in to PCS Playbook to review the request.`
        );
      }
    } catch (emailError) {
      console.log('Email notification failed:', emailError.message);
    }

    res.status(201).json({
      message: assignedMentorId
        ? 'Mentor request submitted and assigned.'
        : 'Mentor request submitted. Waiting for mentor assignment.'
    });

  } catch (error) {
    res.status(500).json({
      message: 'Server error.',
      error: error.message
    });
  }
};

exports.getMyRequests = async (req, res) => {
  try {
    const mentee_user_id = req.user.user_id;

    const [rows] = await pool.query(
      `SELECT 
        mr.*,
        i.installation_name,
        u.first_name AS mentor_first_name,
        u.last_name AS mentor_last_name,
        u.email AS mentor_email,
        u.phone AS mentor_phone
       FROM mentor_requests mr
       JOIN installations i
        ON mr.installation_id = i.installation_id
       LEFT JOIN users u
        ON mr.mentor_user_id = u.user_id
       WHERE mr.mentee_user_id = ?
       ORDER BY mr.created_at DESC`,
      [mentee_user_id]
    );

    res.json(rows);

  } catch (error) {
    res.status(500).json({
      message: 'Server error.',
      error: error.message
    });
  }
};

exports.getMentorQueue = async (req, res) => {
  try {
    const mentor_user_id = req.user.user_id;

    const [mentorRows] = await pool.query(
      'SELECT installation_id FROM mentor_profiles WHERE user_id = ? AND is_available = TRUE',
      [mentor_user_id]
    );

    if (mentorRows.length === 0) {
      return res.json([]);
    }

    const installation_id = mentorRows[0].installation_id;

    const [rows] = await pool.query(
      `SELECT 
        mr.*,
        i.installation_name
       FROM mentor_requests mr
       JOIN installations i
        ON mr.installation_id = i.installation_id
       WHERE mr.installation_id = ?
       AND mr.status IN ('pending', 'assigned', 'replied')
       ORDER BY mr.created_at DESC`,
      [installation_id]
    );

    res.json(rows);

  } catch (error) {
    res.status(500).json({
      message: 'Server error.',
      error: error.message
    });
  }
};

exports.replyToRequest = async (req, res) => {
  try {
    const mentor_user_id = req.user.user_id;
    const { mentor_reply } = req.body;

    await pool.query(
      `UPDATE mentor_requests
       SET mentor_user_id = ?,
           mentor_reply = ?,
           status = 'replied'
       WHERE request_id = ?`,
      [
        mentor_user_id,
        mentor_reply,
        req.params.id
      ]
    );

    res.json({
      message: 'Reply saved successfully.'
    });

  } catch (error) {
    res.status(500).json({
      message: 'Server error.',
      error: error.message
    });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
        m.*,
        u.first_name,
        u.last_name
       FROM mentor_request_messages m
       JOIN users u ON m.sender_user_id = u.user_id
       WHERE m.request_id = ?
       ORDER BY m.created_at ASC`,
      [req.params.id]
    );

    res.json(rows);

  } catch (error) {
    res.status(500).json({
      message: 'Server error.',
      error: error.message
    });
  }
};

exports.createMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const request_id = req.params.id;
    const sender_user_id = req.user.user_id;
    const sender_role = req.user.role;

    await pool.query(
      `INSERT INTO mentor_request_messages
       (request_id, sender_user_id, sender_role, message)
       VALUES (?, ?, ?, ?)`,
      [
        request_id,
        sender_user_id,
        sender_role,
        message
      ]
    );

    const [requestRows] = await pool.query(
      `SELECT 
        mr.mentee_email,
        mr.mentee_name,
        mr.mentor_user_id,
        u.email AS mentor_email
       FROM mentor_requests mr
       LEFT JOIN users u
        ON mr.mentor_user_id = u.user_id
       WHERE mr.request_id = ?`,
      [request_id]
    );

    const [senderRows] = await pool.query(
      `SELECT first_name, last_name, rank
       FROM users
       WHERE user_id = ?`,
      [sender_user_id]
    );

    const senderName =
      senderRows.length > 0
        ? `${senderRows[0].rank} ${senderRows[0].last_name}, ${senderRows[0].first_name}`
        : 'Someone';

    try {
      if (requestRows.length > 0) {
        const request = requestRows[0];

        if (sender_role === 'mentor') {
          await sendEmail(
            request.mentee_email,
            'New PCS Playbook Mentor Response',
            `You have a new mentor response from ${senderName}. Please log in to PCS Playbook to view the response.`
          );
        }

        if (sender_role === 'mentee' && request.mentor_email) {
          await sendEmail(
            request.mentor_email,
            'New PCS Playbook Mentee Reply',
            `${senderName} just replied to your PCS Playbook conversation. Please log in to respond.`
          );
        }
      }
    } catch (emailError) {
      console.log('Email notification failed:', emailError.message);
    }

    res.status(201).json({
      message: 'Message sent successfully.'
    });

  } catch (error) {
    res.status(500).json({
      message: 'Server error.',
      error: error.message
    });
  }
};