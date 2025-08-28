import { Button, Container, Paper, PasswordInput, Stack, TextInput, Title } from '@mantine/core';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SignupPage() {
  const nav = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/auth/signup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email, address, password }) });
    if (res.ok) nav('/login');
    else {
      const data = await res.json();
      setError('Signup failed');
      console.error(data);
    }
  };

  return (
    <Container size="xs" my="xl">
      <Title order={2}>Sign up</Title>
      <Paper withBorder p="md" mt="md" component="form" onSubmit={onSubmit}>
        <Stack>
          <TextInput label="Name" value={name} onChange={(e) => setName(e.currentTarget.value)} required />
          <TextInput label="Email" value={email} onChange={(e) => setEmail(e.currentTarget.value)} required />
          <TextInput label="Address" value={address} onChange={(e) => setAddress(e.currentTarget.value)} required />
          <PasswordInput label="Password" value={password} onChange={(e) => setPassword(e.currentTarget.value)} required />
          {error && <div style={{ color: 'red' }}>{error}</div>}
          <Button type="submit">Create account</Button>
        </Stack>
      </Paper>
    </Container>
  );
}
