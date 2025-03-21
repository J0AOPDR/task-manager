import "./index.css";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const validar  = z.object({
  nomeTarefa: z.string().min(1, "O campo é obrigatório!"),
  descTarefa: z.string().min(1, "O campo é obrigatório!"),
});

type Tarefa = {
  id: number;
  nome: string;
  descricao: string;
  data: string;
  progresso: string;
};

type FormData = z.infer<typeof validar>;

export function App() {
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [tarefaEditando, setTarefaEditando] = useState<Tarefa | null>(null);
  const [filtroProgresso, setFiltroProgresso] = useState("todos");

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(validar),
  });

  useEffect(() => {
    const tarefasSalvas = localStorage.getItem("tarefas");
    if (tarefasSalvas) {
      try {
        const dados = JSON.parse(tarefasSalvas);
        if (Array.isArray(dados)) setTarefas(dados);
      } catch {
        console.error("Erro ao carregar tarefas do localStorage");
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("tarefas", JSON.stringify(tarefas));
  }, [tarefas]);

  function adicionarTarefa(data: FormData) {
    const novaTarefa = {
      id: Date.now(),
      nome: data.nomeTarefa,
      descricao: data.descTarefa,
      data: new Date().toLocaleDateString(),
      progresso: "Pendente",
    };

    setTarefas((prev) => [...prev, novaTarefa]);
    reset();
  }

  function removerTarefa(id: number) {
    setTarefas((prev) => prev.filter((tarefa) => tarefa.id !== id));
  }

  function abrirModalEdicao(tarefa: Tarefa) {
    setTarefaEditando(tarefa);
    setModalAberto(true);
  }

  function salvarEdicao(event: React.FormEvent) {
    event.preventDefault();
    if (!tarefaEditando) return;

    setTarefas((prev) =>
      prev.map((t) => (t.id === tarefaEditando.id ? { ...tarefaEditando } : t))
    );

    setModalAberto(false);
    setTarefaEditando(null);
  }

  const tarefasFiltradas =
    filtroProgresso === "todos"
      ? tarefas
      : tarefas.filter((tarefa) => tarefa.progresso === filtroProgresso);

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-zinc-100 gap-8 p-4">
      {/* Formulário de criação */}
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-xl text-center">Criar Tarefa</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={handleSubmit(adicionarTarefa)}>
            <div className="grid gap-2">
              <Label>Nome</Label>
              <Input type="text" {...register("nomeTarefa")} />
              {errors.nomeTarefa && <p className="text-red-500 text-xs">{errors.nomeTarefa.message}</p>}
            </div>
            <div className="grid gap-2">
              <Label>Descrição</Label>
              <Textarea className="resize-none" {...register("descTarefa")} />
              {errors.descTarefa && <p className="text-red-500 text-xs">{errors.descTarefa.message}</p>}
            </div>
            <Button type="submit" className="w-full">Salvar</Button>
          </form>
        </CardContent>
      </Card>

      {/* Lista de tarefas */}
      <Card className="w-full max-w-2xl">
        <CardContent>
          <div className="mb-4">
            <Select value={filtroProgresso} onValueChange={setFiltroProgresso}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filtrar por Progresso" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="Pendente">Pendente</SelectItem>
                <SelectItem value="Em andamento">Em andamento</SelectItem>
                <SelectItem value="Concluída">Concluída</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {tarefasFiltradas.length === 0 ? (
            <p className="text-center text-gray-500">Nenhuma tarefa encontrada.</p>
          ) : (
            tarefasFiltradas.map((tarefa) => (
              <div key={tarefa.id} className="flex justify-between items-center border-b py-4">
                <div>
                  <p className="font-semibold mb-1">{tarefa.nome}</p>
                  <p className="text-gray-500 text-sm mb-1">{tarefa.descricao}</p>
                  <p className="text-gray-400 text-xs">{tarefa.data}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => abrirModalEdicao(tarefa)}>Editar</Button>
                    <Button className="bg-red-500 hover:bg-red-400" onClick={() => removerTarefa(tarefa.id)}>Excluir</Button>
                  </div>
                  <p className="text-gray-600 text-sm mr-1">{tarefa.progresso}</p>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Modal de edição */}
      {tarefaEditando && (
        <Dialog open={modalAberto} onOpenChange={setModalAberto}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Tarefa</DialogTitle>
            </DialogHeader>
            <form onSubmit={salvarEdicao} className="grid gap-4">
              <Label>Nome</Label>
              <Input
                type="text"
                value={tarefaEditando.nome}
                onChange={(e) => setTarefaEditando({ ...tarefaEditando, nome: e.target.value })}
              />
              <Label>Descrição</Label>
              <Textarea
                className="resize-none"
                value={tarefaEditando.descricao}
                onChange={(e) => setTarefaEditando({ ...tarefaEditando, descricao: e.target.value })}
              />
              <Label>Progresso</Label>
              <Select
                value={tarefaEditando.progresso}
                onValueChange={(value) => setTarefaEditando({ ...tarefaEditando, progresso: value })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Progresso" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pendente">Pendente</SelectItem>
                  <SelectItem value="Em andamento">Em andamento</SelectItem>
                  <SelectItem value="Concluída">Concluída</SelectItem>
                </SelectContent>
              </Select>
              <Button type="submit" className="w-full">Salvar Alterações</Button>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
