<template>
  <div class="client-list-container">
        <div class="card-header">
          <h2>Lista de Clientes</h2>
        </div>

      <!-- Barra de búsqueda -->
      <div class="search-bar">
        <el-input
            v-model="searchQuery"
            placeholder="Buscar clientes..."
            clearable
            @clear="resetSearch"
            @keyup.enter="handleSearch"
        >
          <template #append>
            <el-button :icon="Search" @click="handleSearch" />
          </template>
        </el-input>
      </div>

      <!-- Tabla de clientes -->
      <el-table
          :data="paginatedClients"
          border
          style="width: 100%"
          v-loading="loading"
          pag
          empty-text="No hay clientes para mostrar"
      >
        <el-table-column prop="id" label="ID" width="80" sortable />
        <el-table-column prop="nombre" label="Nombre" sortable />
        <el-table-column prop="telefono" label="Teléfono" sortable />

        <el-table-column label="Acciones" width="120">
          <template #default="scope">
            <el-button
                type="primary"
                size="small"
                :icon="Edit"
                @click="handleEdit(scope.row)"
            />
          </template>
        </el-table-column>
      </el-table>

      <!-- Paginación -->
      <div class="pagination">
        <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[5, 10, 20, 50]"
            layout="total, sizes, prev, pager, next"
            :total="filteredClients.length"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
        />
      </div>

    <!-- Diálogo de edición -->
    <el-dialog
        v-model="dialogVisible"
        :title="`Editar Cliente ${editingClient?.id}`"
        width="30%"
    >
      <el-form
          :model="editingClient"
          label-position="top"
          @submit.prevent="saveClient"
      >
        <el-form-item label="Nombre">
          <el-input v-model="editingClient.nombre" />
        </el-form-item>
        <el-form-item label="Teléfono">
          <el-input v-model="editingClient.telefono" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">Cancelar</el-button>
          <el-button type="primary" @click="saveClient"> Guardar </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import {ref, computed, onMounted, toRaw} from 'vue'
import { Search, Edit } from '@element-plus/icons-vue'
import {ElMessage, ElNotification} from 'element-plus'
import {Cliente} from "../../electron/shared/Types.ts";
import {CustomResponse} from "../../electron/shared/CustomResponse.ts";


// Estado reactivo
const clients = ref<Cliente[]>([])
const loading = ref(false)
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const dialogVisible = ref(false)
const editingClient = ref<Cliente | null>(null)

// Obtener clientes (simulando llamada API)
const fetchClients = async () => {
  try {
    loading.value = true
    // Simulando retraso de red
    let response:CustomResponse = await window.electronApi.loadClientes();
    if (response.estatus == 200) {
      clients.value = response.data;
    } else {
      ElNotification({
        title: 'Error',
        message: 'Ocurrió un error, busque a soporte'
      })
    }

  } catch (error) {
    ElMessage.error('Error al cargar los clientes')
    console.error(error)
  } finally {
    loading.value = false
  }
}

// Filtrar clientes basado en la búsqueda
const filteredClients = computed(() => {

  if (!searchQuery.value) return clients.value

  const query = searchQuery.value.toLowerCase()
  return clients.value.filter(
      (client:Cliente) =>
          client.nombre.toLowerCase().includes(query) ||
          (client.telefono && client.telefono.toLowerCase().includes(query)) ||
          client.id.toString().includes(query))
})

// Paginación
const paginatedClients = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredClients.value.slice(start, end)
})

// Manejar búsqueda
const handleSearch = () => {
  currentPage.value = 1 // Resetear a la primera página al buscar
}

// Resetear búsqueda
const resetSearch = () => {
  searchQuery.value = ''
  currentPage.value = 1
}

// Manejar cambio de tamaño de página
const handleSizeChange = (val: number) => {
  pageSize.value = val
}

// Manejar cambio de página
const handleCurrentChange = (val: number) => {
  currentPage.value = val
}

// Editar cliente
const handleEdit = (client: Cliente) => {
  editingClient.value = { ...client }
  dialogVisible.value = true
}

// Guardar cambios del cliente
const saveClient = async () => {
  if (!editingClient.value) return

  try {
    loading.value = true
    let response:CustomResponse = await window.electronApi.updateClient(toRaw(editingClient.value));
    if (response.estatus == 200) {
      // Encontrar y actualizar el cliente en el array
      const index = clients.value.findIndex(
          (c) => c.id === editingClient.value?.id
      )
      if (index !== -1) {
        clients.value[index] = { ...editingClient.value }
      }
      ElMessage.success('Cliente actualizado correctamente')
    } else {
      ElMessage.error('Error al actualizar el cliente. Busque a soporte')
      console.error(response.detailedMessage)
    }
    dialogVisible.value = false
  } catch (error) {
    ElMessage.error('Error al actualizar el cliente')
    console.error(error)
  } finally {
    loading.value = false
  }
}

// Cargar datos al montar el componente
onMounted(() => {
  fetchClients()
})
</script>

<style scoped>


.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-bar {
  margin-bottom: 20px;
  max-width: 400px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.el-table {
  margin-top: 20px;
}
</style>