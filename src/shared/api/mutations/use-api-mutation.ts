import { useMutation, UseMutationOptions } from '@tanstack/react-query';

export function useApiMutation<TData, TVariables, TError = Error, TContext = unknown>(
  options: UseMutationOptions<TData, TError, TVariables, TContext>,
) {
  return useMutation<TData, TError, TVariables, TContext>(options);
}
