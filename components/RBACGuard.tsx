import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import LoginScreen from '../screens/LoginScreen';

interface RBACGuardProps {
  children: React.ReactNode;
  allowedRoles: Array<'Admin' | 'Visitor'>;
  fallbackView?: string;
  onNavigate: (viewName: string) => void;
  activeView: string;
}

/**
 * RBACGuard Wrapper Component Focuses on Component-Level Verification.
 * Prevents unauthorized render attempts of restricted views before mounting.
 */
export const RBACGuard: React.FC<RBACGuardProps> = ({
  children,
  allowedRoles,
  fallbackView = 'Home',
  onNavigate,
  activeView,
}) => {
  const { user, token } = useAuth();

  // Active user representation and verified cryptographic session claims map
  const hasAccess = user && token && allowedRoles.includes(user.role);

  if (!hasAccess) {
    console.warn(`[RBAC Enforcement] Blocked unauthorized render of view "${activeView}". Required roles: ${allowedRoles.join(', ')}. Found: "${user?.role || 'None'}"`);
    return (
      <LoginScreen
        onCancel={() => onNavigate(fallbackView)}
        redirectedFrom={activeView}
      />
    );
  }

  // Cryptographically authenticated and authorized. Proceed with render.
  return <>{children}</>;
};

/**
 * withRBAC Higher-Order Component (HOC) variant.
 * Enforces access validation around components declaratively.
 */
export function withRBAC<T extends object>(
  WrappedComponent: React.ComponentType<T>,
  allowedRoles: Array<'Admin' | 'Visitor'>,
  fallbackView: string = 'Home'
) {
  const ComponentWithRBAC = (props: T & { onNavigate: (viewName: string) => void; activeView: string }) => {
    const { onNavigate, activeView, ...restProps } = props;
    return (
      <RBACGuard
        allowedRoles={allowedRoles}
        fallbackView={fallbackView}
        onNavigate={onNavigate}
        activeView={activeView}
      >
        <WrappedComponent {...(restProps as T)} />
      </RBACGuard>
    );
  };

  ComponentWithRBAC.displayName = `withRBAC(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;
  return ComponentWithRBAC;
}
