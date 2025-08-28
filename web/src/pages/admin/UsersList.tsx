import { Alert, Button, Container, Group, Modal, Select, Stack, Table, TextInput, Title } from '@mantine/core';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authHeader, useAuth } from '../../state/auth';

export default function UsersList() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [role, setRole] = useState<string | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [opened, setOpened] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'ADMIN' | 'USER' | 'OWNER'>('USER');
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    const params = new URLSearchParams();
    if (name) params.set('name', name);
    if (email) params.set('email', email);
    if (address) params.set('address', address);
    if (role) params.set('role', role);
    params.set('sortBy', sortBy);
    params.set('sortOrder', sortOrder);
    const res = await fetch(`/api/users?${params.toString()}`, { headers: { ...authHeader(token) } });
    if (res.ok) setUsers((await res.json()).items);
  };

  useEffect(() => { load(); }, [name, email, address, role]);

  const createUser = async () => {
    setError(null);
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader(token) },
      body: JSON.stringify({ name: newName, email: newEmail, address: newAddress, password: newPassword, role: newRole })
    });
    if (res.ok) {
      setOpened(false);
      setNewName(''); setNewEmail(''); setNewAddress(''); setNewPassword(''); setNewRole('USER');
      load();
    } else {
      const data = await res.json();
      const errors = data.errors?.fieldErrors;
      if (errors) {
        const messages = Object.entries(errors)
          .map(([field, msgs]) => `${field}: ${(msgs as string[]).join(', ')}`)
          .join('\n');
        setError(messages);
      } else {
        setError('Failed to create user. Please check all fields.');
      }
    }
  };

  return (
    <Container my="lg">
      <Title order={2}>Users</Title>
      <Group mt="md" wrap="wrap">
        <TextInput placeholder="Name" value={name} onChange={(e) => setName(e.currentTarget.value)} />
        <TextInput placeholder="Email" value={email} onChange={(e) => setEmail(e.currentTarget.value)} />
        <TextInput placeholder="Address" value={address} onChange={(e) => setAddress(e.currentTarget.value)} />
        <Select placeholder="Role" data={[{ value: 'ADMIN', label: 'ADMIN' }, { value: 'USER', label: 'USER' }, { value: 'OWNER', label: 'OWNER' }]} value={role} onChange={setRole} clearable />
        <Button onClick={() => setOpened(true)}>Add User</Button>
      </Group>
      <Table mt="md" striped>
        <Table.Thead>
          <Table.Tr>
            <Table.Th 
              style={{ cursor: 'pointer' }}
              onClick={() => {
                if (sortBy === 'name') {
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                } else {
                  setSortBy('name');
                  setSortOrder('asc');
                }
                load();
              }}
            >
              Name {sortBy === 'name' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
            </Table.Th>
            <Table.Th 
              style={{ cursor: 'pointer' }}
              onClick={() => {
                if (sortBy === 'email') {
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                } else {
                  setSortBy('email');
                  setSortOrder('asc');
                }
                load();
              }}
            >
              Email {sortBy === 'email' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
            </Table.Th>
            <Table.Th 
              style={{ cursor: 'pointer' }}
              onClick={() => {
                if (sortBy === 'address') {
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                } else {
                  setSortBy('address');
                  setSortOrder('asc');
                }
                load();
              }}
            >
              Address {sortBy === 'address' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
            </Table.Th>
            <Table.Th 
              style={{ cursor: 'pointer' }}
              onClick={() => {
                if (sortBy === 'role') {
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                } else {
                  setSortBy('role');
                  setSortOrder('asc');
                }
                load();
              }}
            >
              Role {sortBy === 'role' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
            </Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {users.map((u) => (
            <Table.Tr key={u.id} onClick={() => navigate(`/admin/users/${u.id}`)} style={{ cursor: 'pointer' }}>
              <Table.Td>{u.name}</Table.Td>
              <Table.Td>{u.email}</Table.Td>
              <Table.Td>{u.address}</Table.Td>
              <Table.Td>{u.role}</Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      <Modal opened={opened} onClose={() => { setOpened(false); setError(null); }} title="Add User">
        <Stack>
          <TextInput 
            label="Name" 
            value={newName} 
            onChange={(e) => setNewName(e.currentTarget.value)}
            description="Must be at least 20 characters"
          />
          <TextInput 
            label="Email" 
            value={newEmail} 
            onChange={(e) => setNewEmail(e.currentTarget.value)} 
          />
          <TextInput 
            label="Address" 
            value={newAddress} 
            onChange={(e) => setNewAddress(e.currentTarget.value)} 
          />
          <TextInput 
            label="Password" 
            type="password" 
            value={newPassword} 
            onChange={(e) => setNewPassword(e.currentTarget.value)}
            description="At least 8 chars, must include uppercase and special character"
          />
          <Select 
            label="Role" 
            data={[{ value: 'USER', label: 'USER' }, { value: 'ADMIN', label: 'ADMIN' }, { value: 'OWNER', label: 'OWNER' }]} 
            value={newRole} 
            onChange={(v) => setNewRole((v as any) || 'USER')} 
          />
          {error && <Alert color="red" title="Validation Error">{error}</Alert>}
          <Button onClick={createUser}>Create</Button>
        </Stack>
      </Modal>
    </Container>
  );
}
