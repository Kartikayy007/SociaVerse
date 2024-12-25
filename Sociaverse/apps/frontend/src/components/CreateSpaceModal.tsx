import { useState } from 'react';
import axios from 'axios';
import { 
  Modal, 
  Box, 
  Typography, 
  TextField, 
  FormControlLabel,
  Checkbox,
  Button,
  CircularProgress 
} from '@mui/material';

interface CreateSpaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

const CreateSpaceModal = ({ isOpen, onClose, onSuccess }: CreateSpaceModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPublic: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await axios.post(
        'http://localhost:4000/api/v1/spaces', 
        formData,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create space');
      console.error('Failed to create space:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      aria-labelledby="modal-title"
    >
      <Box sx={modalStyle}>
        <Typography id="modal-title" variant="h6" component="h2" mb={3}>
          Create New Space
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            margin="normal"
          />
          <TextField
            fullWidth
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
            margin="normal"
            multiline
            rows={4}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.isPublic}
                onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
              />
            }
            label="Private Space"
            sx={{ my: 2 }}
          />
          {error && (
            <Typography color="error" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
            <Button onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              type="submit"
              className='bg-blue-200 text-white'
              variant="contained"
              disabled={loading}
              startIcon={loading && <CircularProgress size={20} />}
            >
              {loading ? 'Creating...' : 'Create Space'}
            </Button>
          </Box>
        </form>
      </Box>
    </Modal>
  );
};

export default CreateSpaceModal;