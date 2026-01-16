import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useDatabase } from '../context/DatabaseContext';
import { Workspace } from '../types';
import i18n from '../i18n';

export default function WorkspaceSwitcher() {
  const { colors } = useTheme();
  const { workspaces, currentWorkspace, switchWorkspace, createWorkspace } = useDatabase();
  const [modalVisible, setModalVisible] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newIcon] = useState('💼');

  const handleSwitch = async (workspace: Workspace) => {
    await switchWorkspace(workspace.id);
    setModalVisible(false);
  };

  const handleCreate = async () => {
    if (newName.trim()) {
      await createWorkspace(newName, newIcon);
      setNewName('');
      setIsCreating(false);
      // Optional: switch to new workspace? Auto-refresh handles showing it in list
    }
  };

  if (!currentWorkspace) return null;

  return (
    <>
      <TouchableOpacity
        style={[
          styles.switcherButton,
          { backgroundColor: colors.card, borderColor: colors.borderColor },
        ]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.icon}>{currentWorkspace.icon}</Text>
        <Text style={[styles.name, { color: colors.text }]}>{currentWorkspace.name}</Text>
        <Ionicons name="chevron-down" size={16} color={colors.subtleText} />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {i18n.t('workspace.switch', { defaultValue: 'Switch Workspace' })}
            </Text>

            <FlatList
              data={workspaces}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.workspaceItem,
                    item.id === currentWorkspace.id && { backgroundColor: colors.background },
                  ]}
                  onPress={() => handleSwitch(item)}
                >
                  <Text style={styles.workspaceIcon}>{item.icon}</Text>
                  <Text style={[styles.workspaceName, { color: colors.text }]}>{item.name}</Text>
                  {item.id === currentWorkspace.id && (
                    <Ionicons name="checkmark" size={20} color={colors.accent} />
                  )}
                </TouchableOpacity>
              )}
            />

            {isCreating ? (
              <View style={styles.createContainer}>
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: colors.text,
                      backgroundColor: colors.background,
                      borderColor: colors.borderColor,
                    },
                  ]}
                  placeholder="Name"
                  placeholderTextColor={colors.subtleText}
                  value={newName}
                  onChangeText={setNewName}
                />
                <View style={styles.createActions}>
                  <TouchableOpacity
                    onPress={handleCreate}
                    style={[styles.createBtn, { backgroundColor: colors.accent }]}
                  >
                    <Text style={{ color: '#fff' }}>Add</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setIsCreating(false)} style={styles.cancelBtn}>
                    <Text style={{ color: colors.subtleText }}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.addButton, { borderTopColor: colors.borderColor }]}
                onPress={() => setIsCreating(true)}
              >
                <Ionicons name="add" size={20} color={colors.accent} />
                <Text style={[styles.addText, { color: colors.accent }]}>
                  {i18n.t('workspace.new', { defaultValue: 'New Workspace' })}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  switcherButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 8,
  },
  icon: {
    fontSize: 16,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    maxHeight: '60%',
    borderRadius: 16,
    padding: 16,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  workspaceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  workspaceIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  workspaceName: {
    fontSize: 16,
    flex: 1,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 12,
    marginTop: 8,
    borderTopWidth: 1,
    gap: 8,
  },
  addText: {
    fontSize: 16,
    fontWeight: '600',
  },
  createContainer: {
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
  },
  createActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  createBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  cancelBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
});
