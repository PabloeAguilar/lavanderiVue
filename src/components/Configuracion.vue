<template>
    <el-container class="configuracion-container">
        <!-- Encabezado: Sugerencia de piezas individuales -->
        <el-header>
            <h2>Sugerencia de piezas individuales</h2>
        </el-header>
        <el-main>
            <el-table :data="piezas" style="width: 100%;" v-on:row-click="handleEdit">
                <el-table-column prop="nombre" label="Nombre de la pieza" width="200" />
                <el-table-column prop="precio_individual" label="Precio sugerido" />
            </el-table>
        </el-main>

        <el-dialog v-model="editandoPieza" :title="`Editar Pieza ${editingPieza?.id}`" width="30%">
            <el-form :model="editingPieza" label-position="top" @submit.prevent="savePieza">
                <el-form-item label="Nombre">
                    <el-input v-model="editingPieza.nombre" />
                </el-form-item>
                <el-form-item label="Precio">
                    <el-input v-model="editingPieza.precio_individual" />
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="handleCancelEdit">Cancelar</el-button>
                    <el-button type="primary" @click="savePieza"> Guardar </el-button>
                </span>
            </template>
        </el-dialog>
        <!-- Aquí puedes agregar más secciones con otros encabezados -->
    </el-container>
</template>

<script setup lang="ts">
import { onMounted, ref, toRaw } from 'vue'
import { ElMessage, ElContainer, ElHeader, ElMain, ElTable, ElTableColumn, ElDialog, ElForm, ElFormItem, ElInput, ElButton } from 'element-plus';
import { CustomResponse } from '../../electron/shared/CustomResponse';
import { SugerenciaPieza } from '../../electron/shared/Types';

const piezas = ref<SugerenciaPieza[]>([]);
const editingPieza = ref<SugerenciaPieza>();
const editandoPieza = ref<boolean>(false);


var handleEdit = (pieza: SugerenciaPieza) => {
    editingPieza.value = { ...pieza }; // Clonar el objeto para evitar mutaciones directas
    editandoPieza.value = true; // Abrir el diálogo de edición
}

function handleCancelEdit() {
    editandoPieza.value = false; // Cerrar el diálogo sin guardar cambios
}


const savePieza = () => {
    if (editingPieza.value) {
        window.electronApi.actualizarSugerenciaPieza(toRaw(editingPieza.value)).then((response: boolean) => {
            if (response) {
                ElMessage.success('Pieza actualizada correctamente');
                editandoPieza.value = false; // Cerrar el diálogo
                // Actualizar la lista de piezas
                fetchPiezas();
            } else {
                ElMessage.error('Error al actualizar la pieza');
            }
        }).catch((error) => {
            console.error('Error al actualizar la pieza:', error);
            ElMessage.error('Error al actualizar la pieza');
        });
    }
};

onMounted(() => {
    // Aquí podrías cargar datos iniciales o realizar alguna acción al montar el componente
    fetchPiezas();
});

function fetchPiezas() {
    window.electronApi.obtenerListaSugerenciasPiezas().then((response: CustomResponse) => {
        if (response.estatus === 200) {
            piezas.value = response.data || [];
        } else {
            ElMessage.error('Error al cargar las sugerencias de piezas');
        }
    }).catch((error) => {
        console.error('Error al cargar las sugerencias de piezas:', error);
        ElMessage.error('Error al cargar las sugerencias de piezas');
    });
}
// Datos de ejemplo para la tabla

</script>

<style scoped>
.configuracion-container {
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.el-header {
    height: auto;
}

h2 {
    margin-bottom: 16px;
}
</style>