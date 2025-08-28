import { Alert, Badge, Button, Container, Group, Loader, NumberInput, Paper, Stack, Table, Text, TextInput, Title } from '@mantine/core';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { authHeader, useAuth } from '../state/auth';

export default function StoresPage() {
  const { token, user } = useAuth();
  const [q, setQ] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(true);
  const [stores, setStores] = useState<any[]>([]);
  const [myRatings, setMyRatings] = useState<Record<string, number | null>>({});
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const load = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set('name', q);
    if (address) params.set('address', address);
    params.set('sortBy', sortBy);
    params.set('sortOrder', sortOrder);
    const res = await fetch(`/api/stores?${params.toString()}`, { headers: { ...authHeader(token) } });
    if (!res.ok) {
      setStores([]);
    } else {
      const data = await res.json();
      setStores(Array.isArray(data.items) ? data.items : []);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const submitRating = async (storeId: string, value: number) => {
    const res = await fetch('/api/ratings', { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeader(token) }, body: JSON.stringify({ storeId, value }) });
    if (res.ok) {
      setMyRatings((r) => ({ ...r, [storeId]: value }));
      load();
    }
  };

  return (
    <Container my="lg">
      <Stack>
        {user?.role === 'OWNER' && (
          <Alert color="blue" title="Store Owner">
            Welcome! View your store's ratings and customer feedback in your{' '}
            <Link to="/owner">Store Dashboard</Link>.
          </Alert>
        )}
        <Title order={2}>Stores</Title>
        <Group mt="md">
        <TextInput placeholder="Search by name" value={q} onChange={(e) => setQ(e.currentTarget.value)} />
        <TextInput placeholder="Search by address" value={address} onChange={(e) => setAddress(e.currentTarget.value)} />
        <Button onClick={load}>Search</Button>
      </Group>
      <Paper withBorder p="md" mt="md">
        {loading ? <Loader /> : (
          <Table striped highlightOnHover>
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
                  Store {sortBy === 'name' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
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
                    if (sortBy === 'rating') {
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortBy('rating');
                      setSortOrder('asc');
                    }
                    load();
                  }}
                >
                  Rating {sortBy === 'rating' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                </Table.Th>
                <Table.Th>My Rating</Table.Th>
                <Table.Th>Action</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {(stores || []).map((s) => (
                <Table.Tr key={s.id} style={s.isOwner ? { backgroundColor: 'var(--mantine-color-blue-0)' } : undefined}>
                  <Table.Td>
                    {s.name}
                    {s.isOwner && <Badge ml="xs" color="blue">Your Store</Badge>}
                  </Table.Td>
                  <Table.Td>{s.address}</Table.Td>
                  <Table.Td>{s.rating ? s.rating.toFixed(2) : '-'}</Table.Td>
                  <Table.Td>{(myRatings[s.id] ?? s.myRating) ?? '-'}</Table.Td>
                  <Table.Td>
                    {user?.role === 'USER' ? (
                      <NumberInput min={1} max={5} step={1} onChange={(v) => typeof v === 'number' && submitRating(s.id, v)} />
                    ) : s.isOwner ? (
                      <Button component={Link} to="/owner" variant="light" color="blue">View Dashboard</Button>
                    ) : (
                      <Text size="sm" c="dimmed">Login as a normal user to rate</Text>
                    )}
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
      </Paper>
      </Stack>
    </Container>
  );
}
