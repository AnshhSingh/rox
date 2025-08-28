import { Button, Card, Container, Grid, Group, Stack, Text, Title } from '@mantine/core';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { authHeader, useAuth } from '../../state/auth';

export default function AdminDashboard() {
  const { token } = useAuth();
  const [metrics, setMetrics] = useState<{ users: number; stores: number; ratings: number } | null>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/admin/metrics', { headers: { ...authHeader(token) } });
      if (res.ok) {
        setMetrics(await res.json());
      } else {
        setMetrics(null);
        //  console.log('Failed to load metrics', res.status);
      }
    })();
  }, [token]);

  return (
    <Container my="lg">
      <Stack>
        <Title order={2}>Admin Dashboard</Title>
        
        {/* Quick Stats */}
        <Grid mt="md">
          <Grid.Col span={4}>
            <Card withBorder p="md">
              <Text size="lg" fw={500}>Users</Text>
              <Text size="xl" fw={700}>{metrics?.users ?? '-'}</Text>
              <Button component={Link} to="/admin/users" variant="light" fullWidth mt="sm">
                Manage Users
              </Button>
            </Card>
          </Grid.Col>
          <Grid.Col span={4}>
            <Card withBorder p="md">
              <Text size="lg" fw={500}>Stores</Text>
              <Text size="xl" fw={700}>{metrics?.stores ?? '-'}</Text>
              <Button component={Link} to="/admin/stores" variant="light" fullWidth mt="sm">
                Manage Stores
              </Button>
            </Card>
          </Grid.Col>
          <Grid.Col span={4}>
            <Card withBorder p="md">
              <Text size="lg" fw={500}>Total Ratings</Text>
              <Text size="xl" fw={700}>{metrics?.ratings ?? '-'}</Text>
            </Card>
          </Grid.Col>
        </Grid>

        {/* Quick Actions */}
        <Card withBorder p="md" mt="md">
          <Title order={3} size="h4">Quick Actions</Title>
          <Group mt="md">
            <Button component={Link} to="/admin/users" variant="filled">
              View All Users
            </Button>
            <Button component={Link} to="/admin/stores" variant="filled">
              View All Stores
            </Button>
          </Group>
        </Card>

        {/* Admin Features */}
        <Card withBorder p="md" mt="md">
          <Title order={3} size="h4">Available Features</Title>
          <Grid mt="md">
            <Grid.Col span={6}>
              <Card withBorder>
                <Title order={4} size="h5">Users Management</Title>
                <Text size="sm" mt="xs" c="dimmed">
                  • View all users (normal, admin, owners)<br />
                  • Add new users with any role<br />
                  • Filter by name, email, address, role<br />
                  • View user details and ratings
                </Text>
              </Card>
            </Grid.Col>
            <Grid.Col span={6}>
              <Card withBorder>
                <Title order={4} size="h5">Stores Management</Title>
                <Text size="sm" mt="xs" c="dimmed">
                  • View all stores and their ratings<br />
                  • Add new stores<br />
                  • Filter by name, email, address<br />
                  • Assign stores to owners
                </Text>
              </Card>
            </Grid.Col>
          </Grid>
        </Card>
      </Stack>
    </Container>
  );
}
