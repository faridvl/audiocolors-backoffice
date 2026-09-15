import { useMutation, UseMutationOptions } from '@tanstack/react-query';

export function useApiMutation<TData, TVariables, TError = Error>(
  options: UseMutationOptions<TData, TError, TVariables>,
) {
  return useMutation<TData, TError, TVariables>(options);
}
