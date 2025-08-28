import { Anchor, AppShell, Button, Group, Text } from '@mantine/core';
import { Link } from 'react-router-dom';
import { useAuth } from '../../state/auth';

export default function Nav({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  return (
    <AppShell header={{ height: 56 }}>
      <AppShell.Header>
        <Group px="md" h="100%" justify="space-between">
          <Group>
            <Anchor component={Link} to="/">Stores</Anchor>
            {user?.role === 'ADMIN' && (
              <Group>
                <Anchor component={Link} to="/admin">Admin</Anchor>
                <Anchor component={Link} to="/admin/users">Users</Anchor>
                <Anchor component={Link} to="/admin/stores">Stores</Anchor>
              </Group>
            )}
            {user?.role === 'OWNER' && (
              <Group>
                <Anchor component={Link} to="/owner">My Store</Anchor>
              </Group>
            )}
          </Group>
          <Group>
            {user ? (
              <>
                <Text>{user.email} ({user.role})</Text>
                <Button size="compact-sm" component={Link} to="/change-password" variant="outline">Change Password</Button>
                <Button size="compact-sm" variant="light" onClick={logout}>Logout</Button>
              </>
            ) : (
              <>
                <Button component={Link} to="/login" variant="subtle">Login</Button>
                <Button component={Link} to="/signup">Sign up</Button>
              </>
            )}
          </Group>
        </Group>
      </AppShell.Header>
      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
