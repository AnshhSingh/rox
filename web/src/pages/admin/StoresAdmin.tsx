import { Button, Container, Group, Modal, Select, Stack, Table, TextInput, Title } from '@mantine/core';
import { useEffect, useState } from 'react';
import { authHeader, useAuth } from '../../state/auth';

export default function StoresAdmin() {
  const { token } = useAuth();
  // Filters
  const [nameFilter, setNameFilter] = useState('');
  const [emailFilter, setEmailFilter] = useState('');
  const [addressFilter, setAddressFilter] = useState('');
  const [stores, setStores] = useState<any[]>([]);
  const [opened, setOpened] = useState(false);
  // Modal fields
  const [nameNew, setNameNew] = useState('');
  const [emailNew, setEmailNew] = useState('');
  const [addressNew, setAddressNew] = useState('');
  const [ownerNew, setOwnerNew] = useState<string | null>(null);
  const [owners, setOwners] = useState<{ value: string; label: string }[]>([]);

  const loadOwners = async () => {
    const res = await fetch('/api/users?role=OWNER', { headers: { ...authHeader(token) } });
    if (res.ok) {
      const data = await res.json();
      setOwners(data.items.map((u: any) => ({ value: u.id, label: `${u.name} (${u.email})` })));
    }
  };

  const load = async () => {
    const params = new URLSearchParams();
  if (nameFilter) params.set('name', nameFilter);
  if (emailFilter) params.set('email', emailFilter);
    if (addressFilter) params.set('address', addressFilter);
    const res = await fetch(`/api/stores?${params.toString()}`, { headers: { ...authHeader(token) } });
    if (res.ok) setStores((await res.json()).items);
  };

  const createStore = async () => {
    const res = await fetch('/api/stores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader(token) },
      body: JSON.stringify({ name: nameNew, email: emailNew, address: addressNew, ownerId: ownerNew })
    });
    if (res.ok) {
      setOpened(false);
      setNameNew('');
      setEmailNew('');
      setAddressNew('');
      setOwnerNew(null);
      load();
    }
  };

  useEffect(() => { load(); }, [nameFilter, emailFilter, addressFilter]);
  useEffect(() => { loadOwners(); }, []);

  return (
    <Container my="lg">
      <Title order={2}>Stores</Title>
      <Group mt="md" wrap="wrap">
  <TextInput placeholder="Name" value={nameFilter} onChange={(e) => setNameFilter(e.currentTarget.value)} />
  <TextInput placeholder="Email" value={emailFilter} onChange={(e) => setEmailFilter(e.currentTarget.value)} />
        <TextInput placeholder="Address" value={addressFilter} onChange={(e) => setAddressFilter(e.currentTarget.value)} />
        <Button onClick={() => setOpened(true)}>Add Store</Button>
      </Group>
      <Table mt="md" striped>
        <Table.Thead><Table.Tr><Table.Th>Name</Table.Th><Table.Th>Email</Table.Th><Table.Th>Address</Table.Th><Table.Th>Rating</Table.Th></Table.Tr></Table.Thead>
        <Table.Tbody>
          {stores.map((s) => (<Table.Tr key={s.id}><Table.Td>{s.name}</Table.Td><Table.Td>{s.email}</Table.Td><Table.Td>{s.address}</Table.Td><Table.Td>{s.rating ? s.rating.toFixed(2) : '-'}</Table.Td></Table.Tr>))}
        </Table.Tbody>
      </Table>
      <Modal opened={opened} onClose={() => setOpened(false)} title="Add Store">
        <Stack>
          <TextInput label="Name" value={nameNew} onChange={(e) => setNameNew(e.currentTarget.value)} />
          <TextInput label="Email" value={emailNew} onChange={(e) => setEmailNew(e.currentTarget.value)} />
          <TextInput label="Address" value={addressNew} onChange={(e) => setAddressNew(e.currentTarget.value)} />
          <Select
            label="Owner (Optional)"
            placeholder="Select store owner"
            data={owners}
            value={ownerNew}
            onChange={setOwnerNew}
            clearable
          />
          <Button onClick={createStore}>Create</Button>
        </Stack>
      </Modal>
    </Container>
  );
}
