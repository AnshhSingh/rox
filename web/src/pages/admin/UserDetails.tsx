import { Alert, Card, Container, Divider, Group, Skeleton, Stack, Text, Title } from '@mantine/core';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { authHeader, useAuth } from '../../state/auth';

export default function UserDetails() {
  const { token } = useAuth();
  const { id } = useParams();
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await fetch(`/api/users/${id}`, { headers: { ...authHeader(token) } });
      if (res.ok) setData(await res.json());
      setLoading(false);
    })();
  }, [id, token]);
  return (
    <Container my="lg">
      <Title order={2}>User Details</Title>
      {loading ? <Skeleton height={200} mt="md" /> : data ? (
        <Stack mt="md">
          <Card withBorder p="md">
            <Stack>
              <Text><b>Name:</b> {data.name}</Text>
              <Text><b>Email:</b> {data.email}</Text>
              <Text><b>Address:</b> {data.address}</Text>
              <Text><b>Role:</b> {data.role}</Text>
            </Stack>
          </Card>
          {data.role === 'OWNER' && (
            <Card withBorder p="md">
              <Title order={3} size="h4">Store Owner Details</Title>
              <Divider my="sm" />
              {data.stores.length === 0 ? (
                <Alert>No stores assigned to this owner.</Alert>
              ) : (
                <Stack>
                  <Text>Manages {data.stores.length} store(s)</Text>
                  <Text><b>Average Rating:</b> {data.rating ? `${data.rating.toFixed(2)} / 5.0` : 'No ratings yet'}</Text>
                </Stack>
              )}
            </Card>
          )}
        </Stack>
      ) : null}
    </Container>
  );
}
