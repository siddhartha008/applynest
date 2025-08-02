// AddUni.jsx
import React, { useState } from 'react';
import { Description, Field, Input, Label, Button } from '@headlessui/react';
import { supabase } from '../../utils/client.js';
import './addUni.css';

export default function AddUni({ onClose, onUniAdded, user }) {
  const [formData, setFormData] = useState({
    uniName: '',
    uniCity: '',
    programName: '',
    deadline: '',
    tuition: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (field) => (e) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!user) {
        throw new Error('No user logged in');
      }

      // Validate required fields
      if (!formData.uniName || !formData.uniCity || !formData.programName) {
        throw new Error('Please fill in all required fields');
      }

      const newUniversity = {
        uniName: formData.uniName,
        uniCity: formData.uniCity,
        programName: formData.programName,
        deadline: formData.deadline || null,
        tuition: formData.tuition ? parseFloat(formData.tuition) : null,
        user_id: user.id
      };

      const { data, error } = await supabase
        .from('universities')
        .insert([newUniversity]);

      if (error) throw error;
      if (onUniAdded) {
        onUniAdded();
      }
    } catch (error) {
      console.error('Error adding university:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const addUniToSupabase = async () => {
    try {
        if (!user) {
        throw new Error('No user logged in');
      }
      const newUniversity = {
        uniName: formData.uniName,
        uniCity: formData.uniCity,
        programName: formData.programName,
        deadline: formData.deadline || null,
        tuition: formData.tuition ? parseFloat(formData.tuition) : null,
        user_id: user.id
      };
      const { data, error } = await supabase
        .from('universities')
        .insert([newUniversity]);

      if (error) throw error;
      if (onUniAdded) {
        onUniAdded();
      }
    } catch (error) {
      console.error('Error adding university:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-uni-container">
      <div className="add-uni-header">
        <h2>Add a New University</h2>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="add-uni-form">
        <Field className="form-field">
          <Label className="field-label">
            University Name *
          </Label>
          <Input
            value={formData.uniName}
            onChange={handleInputChange('uniName')}
            placeholder="e.g., Harvard University"
            required
            className="field-input"
          />
        </Field>

        <Field className="form-field">
          <Label className="field-label">
            Location *
          </Label>

          <Input
            value={formData.uniCity}
            onChange={handleInputChange('uniCity')}
            placeholder="e.g., Boston, MA"
            required
            className="field-input"
          />
        </Field>

        <Field className="form-field">
          <Label className="field-label">
            Program Name *
          </Label>
          <Description className="field-description">
            The specific program or major you're applying for
          </Description>
          <Input
            value={formData.programName}
            onChange={handleInputChange('programName')}
            placeholder="e.g., Computer Science"
            required
            className="field-input"
          />
        </Field>

        <Field className="form-field">
          <Label className="field-label">
            Application Deadline
          </Label>
          <Input
            type="date"
            value={formData.deadline}
            onChange={handleInputChange('deadline')}
            className="field-input"
          />
        </Field>

        <Field className="form-field">
          <Label className="field-label">
            Annual Tuition (USD)
          </Label>
          <Input
            type="number"
            value={formData.tuition}
            onChange={handleInputChange('tuition')}
            placeholder="e.g., 50000"
            min="0"
            className="field-input"
          />
        </Field>

        <div className="form-actions">
          <Button
            type="button"
            onClick={addUniToSupabase}
            disabled={loading}
            className={`cancel-btn ${loading ? 'disabled' : ''}`}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className={`submit-btn ${loading ? 'disabled' : ''}`}
          >
            {loading ? 'Adding...' : 'Add University'}
          </Button>
        </div>
      </form>
    </div>
  );
}