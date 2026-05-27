CREATE DATABASE IF NOT EXISTS pcs_playbook;
USE pcs_playbook;

CREATE TABLE IF NOT EXISTS users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('marine', 'mentor', 'admin') DEFAULT 'marine',
  profile_image_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS installations (
  installation_id INT AUTO_INCREMENT PRIMARY KEY,
  installation_name VARCHAR(150) NOT NULL,
  state VARCHAR(50) NOT NULL,
  zip_code VARCHAR(20) NOT NULL,
  address VARCHAR(255),
  latitude DECIMAL(10, 7),
  longitude DECIMAL(10, 7),
  base_entry_requirements TEXT,
  general_information TEXT,
  unit_contact_info TEXT,
  image_url TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS mentors (
  mentor_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  installation_id INT NOT NULL,
  availability_status ENUM('available', 'unavailable') DEFAULT 'available',
  bio TEXT,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (installation_id) REFERENCES installations(installation_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS mentorship_requests (
  request_id INT AUTO_INCREMENT PRIMARY KEY,
  marine_user_id INT NOT NULL,
  mentor_id INT NOT NULL,
  installation_id INT NOT NULL,
  request_message TEXT,
  status ENUM('pending', 'approved', 'denied') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (marine_user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (mentor_id) REFERENCES mentors(mentor_id) ON DELETE CASCADE,
  FOREIGN KEY (installation_id) REFERENCES installations(installation_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS installation_updates (
  update_id INT AUTO_INCREMENT PRIMARY KEY,
  installation_id INT NOT NULL,
  admin_user_id INT NOT NULL,
  update_description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (installation_id) REFERENCES installations(installation_id) ON DELETE CASCADE,
  FOREIGN KEY (admin_user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

INSERT INTO installations
(installation_name, state, zip_code, address, latitude, longitude, base_entry_requirements, general_information, unit_contact_info, image_url)
VALUES
('Camp Pendleton', 'CA', '92055', 'Oceanside, CA', 33.3178, -117.3205, 'Valid military ID, vehicle registration, and base access approval required.', 'Large Marine Corps installation in Southern California.', 'Base information office: update with official contact.', ''),
('MCAS Miramar', 'CA', '92145', 'San Diego, CA', 32.8684, -117.1425, 'Valid military ID and gate access required.', 'Marine Corps Air Station located in San Diego.', 'Unit contact information managed by admin.', ''),
('Camp Lejeune', 'NC', '28547', 'Jacksonville, NC', 34.7058, -77.3891, 'Valid military ID and entry requirements based on current base policy.', 'Major Marine Corps installation on the East Coast.', 'Base contact information managed by admin.', '')
ON DUPLICATE KEY UPDATE installation_name = installation_name;
