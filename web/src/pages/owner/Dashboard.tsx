import { Alert, Badge, Card, Container, Grid, Group, Stack, Table, Text, Title } from '@mantine/core';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { authHeader, useAuth } from '../../state/auth';

export default function OwnerDashboard() {
  const { token } = useAuth();
  const [store, setStore] = useState<any>(null);
  const [average, setAverage] = useState<number | null>(null);
  const [raters, setRaters] = useState<Array<{ userId: string; name: string; email: string; value: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/stores/owner/my-store/ratings', { headers: { ...authHeader(token) } });
        if (res.ok) {
          const data = await res.json();
          setStore(data.store);
          setAverage(data.average);
          setRaters(data.raters);
        } else {
          setError('Failed to load store data');
        }
      } catch (e) {
        setError('Error connecting to server');
      }
      setLoading(false);
    })();
  }, [token]);

  return (
    <Container my="lg">
      <Stack>
        <Group justify="space-between" align="flex-start">
          <div>
            <Title order={2}>Store Dashboard</Title>
            {store && <Text c="dimmed" mt={4}>{store.name}</Text>}
          </div>
          <Card withBorder p="xs">
            <Text component={Link} to="/change-password" size="sm">Change Password</Text>
          </Card>
        </Group>

        {error ? (
          <Alert color="red" title="Error">{error}</Alert>
        ) : loading ? (
          <Text>Loading...</Text>
        ) : !store ? (
          <Alert color="yellow" title="No Store Found">
            You don't have any store assigned to you yet. Please contact an administrator.
          </Alert>
        ) : (
          <>
            {/* Store Stats */}
            <Grid>
              <Grid.Col span={6}>
                <Card withBorder>
                  <Stack gap="xs">
                    <Text size="sm" c="dimmed">Store Details</Text>
                    <Text><b>Name:</b> {store.name}</Text>
                    <Text><b>Email:</b> {store.email}</Text>
                    <Text><b>Address:</b> {store.address}</Text>
                  </Stack>
                </Card>
              </Grid.Col>
              <Grid.Col span={6}>
                <Card withBorder>
                  <Stack gap="xs">
                    <Text size="sm" c="dimmed">Rating Summary</Text>
                    <Group>
                      <div>
                        <Text size="sm" c="dimmed">Average Rating</Text>
                        <Text size="xl" fw={700}>{average ? average.toFixed(2) : '-'} / 5.0</Text>
                      </div>
                      <div>
                        <Text size="sm" c="dimmed">Total Reviews</Text>
                        <Text size="xl" fw={700}>{raters.length}</Text>
                      </div>
                    </Group>
                  </Stack>
                </Card>
              </Grid.Col>
            </Grid>

            {/* Ratings List */}
            <Card withBorder>
              <Stack>
                <Group justify="space-between">
                  <Title order={3} size="h4">Customer Ratings</Title>
                  {raters.length === 0 && <Text c="dimmed">No ratings yet</Text>}
                </Group>
                {raters.length > 0 && (
                  <Table striped highlightOnHover>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Customer</Table.Th>
                        <Table.Th>Email</Table.Th>
                        <Table.Th>Rating</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {raters.map((r) => (
                        <Table.Tr key={r.userId}>
                          <Table.Td>{r.name}</Table.Td>
                          <Table.Td>{r.email}</Table.Td>
                          <Table.Td>
                            <Badge size="lg">{r.value} / 5</Badge>
                          </Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                )}
              </Stack>
            </Card>
          </>
        )}
      </Stack>
    </Container>
  );
}
