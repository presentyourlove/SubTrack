import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { database, getAllSubscriptions, addSubscription } from '../services';
import { Subscription } from '../types';

export function useSubscriptionsQuery(workspaceId: number | undefined) {
  return useQuery({
    queryKey: ['subscriptions', workspaceId],
    queryFn: async () => {
      if (!database || !workspaceId) return [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return getAllSubscriptions(database as any, workspaceId);
    },
    enabled: !!database && !!workspaceId,
  });
}

// Example Mutation
export function useAddSubscriptionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      subscription,
      workspaceId,
    }: {
      subscription: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>;
      workspaceId: number;
    }) => {
      if (!database) throw new Error('Database not initialized');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const id = await addSubscription(database as any, { ...subscription, workspaceId });
      return id;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions', variables.workspaceId] });
    },
  });
}
