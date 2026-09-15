import { useQuery } from '@tanstack/react-query'

function App() {
  const { data, isLoading } = useQuery({
    queryKey: ['smoke-test'],
    queryFn: async () => 'TanStack Query is working',
  })

  return (
    <div className="p-8 bg-blue-600 text-white text-xl font-bold rounded-lg m-8">
      {isLoading ? 'Loading...' : data}
    </div>
  )
}

export default App