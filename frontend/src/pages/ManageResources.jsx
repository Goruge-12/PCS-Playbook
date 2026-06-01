import React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function ManageResources() {
  const navigate = useNavigate();
  const [resources, setResources] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');

  const [popup, setPopup] = useState({
    show: false,
    title: '',
    message: ''
  });

  const categories = [
    'General',
    'Unit Training',
    'Personal and Professional Readiness',
    'Transition Readiness Program',
    'Career / Technical Credentialing',
    'Voluntary Education',
    'The Leadership Scholar Program',
    'Enlisted Marines; Manage your career and engage your monitor',
    'Pay and Compensation',
    'Safety / Operational Risk Management',
    'Insurance'
  ];

  const [form, setForm] = useState({
    category: '',
    title: '',
    description: '',
    website_url: '',
    display_order: 0,
    is_active: 1
  });

  useEffect(() => {
    loadResources();
  }, []);

  function openPopup(title, message) {
    setPopup({
      show: true,
      title,
      message
    });
  }

  function closePopup() {
    setPopup({
      show: false,
      title: '',
      message: ''
    });
  }

  async function loadResources() {
    try {
      const res = await api.get('/resources/admin');
      setResources(res.data);
    } catch {
      openPopup('Action Failed', 'Failed to load resources.');
    }
  }

  function resetForm() {
    setEditingId(null);

    setForm({
      category: '',
      title: '',
      description: '',
      website_url: '',
      display_order: 0,
      is_active: 1
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.category || !form.title || !form.website_url) {
      openPopup(
        'Missing Information',
        'Category, title, and website URL are required.'
      );
      return;
    }

    try {
      if (editingId) {
        await api.put(`/resources/${editingId}`, form);

        openPopup(
          'Resource Updated',
          'Resource updated successfully.'
        );
      } else {
        await api.post('/resources', form);

        openPopup(
          'Resource Added',
          'Resource added successfully.'
        );
      }

      setSelectedCategory(form.category);
      resetForm();
      loadResources();
    } catch (error) {
      openPopup(
        'Action Failed',
        error.response?.data?.message || 'Resource save failed.'
      );
    }
  }

  function editResource(resource) {
    setEditingId(resource.resource_id);

    setForm({
      category: resource.category || '',
      title: resource.title || '',
      description: resource.description || '',
      website_url: resource.website_url || '',
      display_order: resource.display_order || 0,
      is_active: resource.is_active ? 1 : 0
    });

    setSelectedCategory(resource.category || '');

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  async function deleteResource(resourceId) {
    try {
      await api.delete(`/resources/${resourceId}`);

      openPopup(
        'Resource Deleted',
        'Resource deleted successfully.'
      );

      loadResources();
    } catch {
      openPopup(
        'Action Failed',
        'Failed to delete resource.'
      );
    }
  }

  const filteredResources = selectedCategory
    ? resources.filter((item) => item.category === selectedCategory)
    : [];

  return (
    <section>
        
      {popup.show && (
        <div className="modal-backdrop">
          <div
            className="modal-card"
            style={{
              position: 'relative'
            }}
          >
            <button
              onClick={closePopup}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'transparent',
                color: '#111',
                fontSize: '1.25rem',
                padding: '0.25rem 0.5rem'
              }}
            >
              ×
            </button>

            <h3>{popup.title}</h3>

            <p>{popup.message}</p>

            <button onClick={closePopup}>
              Close
            </button>
          </div>
        </div>
      )}

<div
  style={{
    position: 'relative',
    textAlign: 'center',
    marginBottom: '2rem'
  }}
>
  <button
    type="button"
    className="button"
    onClick={() => window.history.back()}
    style={{
      position: 'absolute',
      left: 0,
      top: 0,
      width: 'fit-content'
    }}
  >
    Go Back
  </button>

  <h2
    style={{
      margin: 0
    }}
  >
    Manage Resources
  </h2>

  <p
    className="muted"
    style={{
      marginTop: '1rem'
    }}
  >
    Add, edit, remove, and organize Marine Corps resource links.
  </p>
</div>
      <div className="card form-card wide">
        <h3 style={{ textAlign: 'center' }}>
          {editingId ? 'Edit Resource' : 'Add Resource'}
        </h3>

        <form onSubmit={handleSubmit}>
          <select
            value={form.category}
            onChange={(e) =>
              setForm({
                ...form,
                category: e.target.value
              })
            }
          >
            <option value="">
              Select Category
            </option>

            {categories.map((category) => (
              <option
                key={category}
                value={category}
              >
                {category}
              </option>
            ))}
          </select>

          <input
            placeholder="Title"
            value={form.title}
            onChange={(e) =>
              setForm({
                ...form,
                title: e.target.value
              })
            }
          />

          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) =>
              setForm({
                ...form,
                description: e.target.value
              })
            }
          />

          <input
            placeholder="Website URL"
            value={form.website_url}
            onChange={(e) =>
              setForm({
                ...form,
                website_url: e.target.value
              })
            }
          />

          <select
            value={form.display_order}
            onChange={(e) =>
              setForm({
                ...form,
                display_order: e.target.value
              })
            }
          >
            <option value={0}>
              Display Order
            </option>

            {[
              1, 2, 3, 4, 5,
              6, 7, 8, 9, 10,
              15, 20, 25, 30
            ].map((num) => (
              <option
                key={num}
                value={num}
              >
                {num}
              </option>
            ))}
          </select>

          <select
            value={form.is_active}
            onChange={(e) =>
              setForm({
                ...form,
                is_active: Number(e.target.value)
              })
            }
          >
            <option value={1}>
              Active
            </option>

            <option value={0}>
              Hidden
            </option>
          </select>

          <button type="submit">
            {editingId ? 'Update Resource' : 'Add Resource'}
          </button>

          {editingId && (
            <button
              type="button"
              className="ghost"
              onClick={resetForm}
            >
              Cancel Edit
            </button>
          )}
        </form>
      </div>

      <div className="card form-card wide">
        <h3 style={{ textAlign: 'center' }}>
          Current Resources
        </h3>

        <label
          style={{
            display: 'block',
            textAlign: 'center',
            fontWeight: '600',
            marginBottom: '.5rem'
          }}
        >
          Select Resource Category
        </label>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          style={{
            width: '100%',
            marginBottom: '2rem'
          }}
        >
          <option value="">
            Choose a Category
          </option>

          {categories.map((category) => (
            <option
              key={category}
              value={category}
            >
              {category}
            </option>
          ))}
        </select>

        {selectedCategory && (
          <>
            <h3
              style={{
                textAlign: 'center',
                fontSize: '24px',
                marginBottom: '2rem'
              }}
            >
              {selectedCategory}
            </h3>

            {filteredResources.length === 0 ? (
              <p className="muted">
                No resources found in this category.
              </p>
            ) : (
              filteredResources.map((item) => (
                <div
                  key={item.resource_id}
                  style={{
                    borderBottom: '1px solid #e5e7eb',
                    padding: '1.5rem 0',
                    textAlign: 'center'
                  }}
                >
                  <h4
                    style={{
                      fontSize: '18px',
                      marginBottom: '1rem'
                    }}
                  >
                    {item.title}
                  </h4>

                  <p className="muted">
                    {item.description}
                  </p>

                  <p>
                    <strong>URL:</strong>{' '}

                    <a
                      href={item.website_url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {item.website_url}
                    </a>
                  </p>

                  <p>
                    <strong>Order:</strong> {item.display_order}{' '}
                    |{' '}
                    <strong>Status:</strong>{' '}
                    {item.is_active ? 'Active' : 'Hidden'}
                  </p>

                  <div
                    className="row center"
                    style={{
                      justifyContent: 'center'
                    }}
                  >
                    <button
                      onClick={() => editResource(item)}
                    >
                      Edit
                    </button>

                    <button
                      className="danger"
                      onClick={() =>
                        deleteResource(item.resource_id)
                      }
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </>
        )}
      </div>
    </section>
  );
}

export default ManageResources;