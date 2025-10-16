<template>
    <div
        style="margin: 15px; padding: 10px;padding-bottom: 30px;box-sizing: border-box;background-color: white;position: relative;">
        <label>
            Test case:
            <select v-model="testId" @change="onChange">
                <option v-for="item in TEST_CASES" :key="item.id" :value="item.id">
                    {{ item.name }}
                </option>
            </select>
        </label>
        <template v-if="testCase">
            <p style="font-weight: 600; margin: 0.5rem 0; white-space: pre-line">
                {{ testCase.instructions }}
            </p>
            <TestCase :key="testId" :value="testCase.value" />
        </template>
    </div>
</template>
<script lang="ts" setup>
import { Descendant, } from 'slate-vue3/core'
import { computed, ref } from 'vue'
import TestCase from './test-case.vue'
import { useRoute, useRouter } from 'vue-router'

interface AndroidTestCase {
    id: string
    name: string
    instructions: string
    value: Descendant[]
}

const TEST_CASES: AndroidTestCase[] = [
    {
        id: '#split-join',
        name: 'Split/Join',
        instructions:
            'Hit enter twice then backspace twice in the following places:\n- Before "before"\n- Between the two "d"s in "middle"\n- After "after"',
        value: [
            {
                type: 'paragraph',
                children: [
                    { text: 'One ' },
                    { text: 'before', bold: true },
                    { text: ' two ' },
                    { text: 'middle', bold: true },
                    { text: ' three ' },
                    { text: 'after', bold: true },
                    { text: ' four' },
                ],
            },
        ],
    },
    {
        id: '#insert',
        name: 'Insertion',
        instructions:
            'Enter text below each line of instruction, including mis-spelling "wasnt"',
        value: [
            {
                type: 'paragraph',
                children: [
                    { text: 'Type by tapping keys: ', bold: true },
                    { text: 'It wasnt me. No.' },
                ],
            },
            {
                type: 'paragraph',
                children: [{ text: '' }],
            },
            {
                type: 'paragraph',
                children: [
                    { text: 'Type using glide typing: ', bold: true },
                    { text: 'Yes Sam, I am.' },
                ],
            },
            {
                type: 'paragraph',
                children: [{ text: '' }],
            },
            {
                type: 'paragraph',
                children: [
                    { text: 'Type using voice input: ', bold: true },
                    { text: 'The quick brown fox jumps over the lazy dog' },
                ],
            },
            {
                type: 'paragraph',
                children: [{ text: '' }],
            },
            {
                type: 'paragraph',
                children: [{ text: 'Write any two words using an IME', bold: true }],
            },
            {
                type: 'paragraph',
                children: [{ text: '' }],
            },
        ],
    },
    {
        id: '#special',
        name: 'Special',
        instructions: 'Follow the instructions on each line',
        value: [
            {
                type: 'paragraph',
                children: [
                    {
                        text: 'Type "it is", move cursor to "i|t" and hit enter.',
                        bold: true,
                    },
                ],
            },
            {
                type: 'paragraph',
                children: [{ text: '' }],
            },
            {
                type: 'paragraph',
                children: [
                    {
                        text: 'Move cursor to "mid|dle" and press space, backspace, space, backspace.',
                        bold: true,
                    },
                ],
            },
            {
                type: 'paragraph',
                children: [{ text: 'The middle word.' }],
            },
            {
                type: 'paragraph',
                children: [
                    {
                        text: 'Place cursor in line below. Wait for caps on keyboard to show up. If not try again. Type "It me. No." and check it doesn\'t mangle on the last period.',
                        bold: true,
                    },
                ],
            },
            {
                type: 'paragraph',
                children: [{ text: '' }],
            },
        ],
    },
    {
        id: '#empty',
        name: 'Empty',
        instructions:
            'Type "hello world", press enter, "hi", press enter, "bye", and then backspace over everything',
        value: [
            {
                type: 'paragraph',
                children: [{ text: '' }],
            },
        ],
    },
    {
        id: '#remove',
        name: 'Remove',
        instructions:
            'Select from ANCHOR to FOCUS and press backspace. Move cursor to end. Backspace over all remaining content.',
        value: [
            {
                type: 'paragraph',
                children: [
                    { text: 'Go and ' },
                    { text: 'select', bold: true },
                    { text: ' from this ANCHOR and then' },
                ],
            },
            {
                type: 'paragraph',
                children: [{ text: 'go and select' }],
            },
            {
                type: 'paragraph',
                children: [
                    { text: 'to this FOCUS then press ' },
                    { text: 'backspace.', bold: true },
                ],
            },
            {
                type: 'paragraph',
                children: [
                    { text: 'After you have done that move selection to very end.' },
                ],
            },
            {
                type: 'paragraph',
                children: [
                    { text: 'Then try ' },
                    { text: 'backspacing', bold: true },
                    { text: ' over all remaining text.' },
                ],
            },
        ],
    },
    {
        id: 'autocorrect',
        name: 'Autocorrect',
        instructions:
            'Type "Cant", then press space to autocorrect it. Make sure the cursor position is correct (after the autocorrected word)',
        value: [
            {
                type: 'paragraph',
                children: [{ text: '' }],
            },
        ],
    },
]

const route = useRoute()
const router = useRouter()
const testId = ref(route.hash || TEST_CASES[0].id)
const testCase = computed(() => TEST_CASES.find(item => item.id === testId.value))

const onChange = () => {
    router.push({ hash: testId.value })
    if (!testCase.value) {
        throw new Error(`Could not find test case '${testId.value}'`)
    }
}
</script>