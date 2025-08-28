import { Button, Container, PasswordInput, Stack, Title } from '@mantine/core';
import { useState } from 'react';
import { authHeader, useAuth } from '../state/auth';

export default function ChangePassword() {
  const { token } = useAuth();
  const [oldPassword, setOld] = useState('');
  const [newPassword, setNew] = useState('');
  const [ok, setOk] = useState<boolean | null>(null);
  const submit = async () => {
    const res = await fetch('/api/auth/change-password', { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeader(token) }, body: JSON.stringify({ oldPassword, newPassword }) });
    setOk(res.ok);
    if (res.ok) { setOld(''); setNew(''); }
  };
  return (
    <Container my="lg">
      <Title order={2}>Change Password</Title>
      <Stack mt="md" maw={420}>
        <PasswordInput label="Old password" value={oldPassword} onChange={(e) => setOld(e.currentTarget.value)} />
        <PasswordInput label="New password" value={newPassword} onChange={(e) => setNew(e.currentTarget.value)} />
        <Button onClick={submit}>Update</Button>
        {ok === true && <div>Password updated.</div>}
        {ok === false && <div>Failed to update password.</div>}
      </Stack>
    </Container>
  );
}
