// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react'

export default function CustomerService ( { isOpen, onClose } )
{
    const [ messages, setMessages ] = useState( [
        { id: 1, type: 'bot', content: 'Hi! Welcome to Onchainweb Customer Support. How can I help you today?', timestamp: new Date() }
    ] )
    const [ inputMessage, setInputMessage ] = useState( '' )
    const [ isTyping, setIsTyping ] = useState( false )
    const messagesEndRef = useRef( null )
    const inputRef = useRef( null )

    useEffect( () => { messagesEndRef.current?.scrollIntoView( { behavior: 'smooth' } ) }, [ messages ] )
    useEffect( () => { if ( isOpen && inputRef.current ) inputRef.current.focus() }, [ isOpen ] )

    const handleClose = () =>
    {
        if ( messages.length > 1 && !window.confirm( 'Close chat?' ) ) return
        onClose()
    }

    const handleSendMessage = async () =>
    {
        if ( !inputMessage.trim() ) return
        setMessages( prev => [ ...prev, { id: Date.now(), type: 'user', content: inputMessage, timestamp: new Date() } ] )
        setInputMessage( '' )
        setIsTyping( true )
        try
        {
            const response = await simulateBackendCall( inputMessage )
            setMessages( prev => [ ...prev, { id: Date.now() + 1, type: 'bot', content: response, timestamp: new Date() } ] )
        } catch
        {
            setMessages( prev => [ ...prev, { id: Date.now() + 1, type: 'bot', content: 'Technical difficulties. Try again.', timestamp: new Date() } ] )
        } finally { setIsTyping( false ) }
    }

    const simulateBackendCall = async ( message ) =>
    {
        await new Promise( r => setTimeout( r, 1000 + Math.random() * 2000 ) )
        const input = message.toLowerCase()
        if ( input.includes( 'urgent' ) ) return '🚨 URGENT: A human agent will contact you within 5 minutes.'
        if ( input.includes( 'arbitrage' ) ) return '🤖 AI Arbitrage: Scans exchanges for price discrepancies.'
        if ( input.includes( 'binary' ) ) return '📈 Binary Options: Fixed-payout trading.'
        if ( input.includes( 'wallet' ) ) return '🔗 Wallet: We support MetaMask, WalletConnect, Coinbase.'
        if ( input.includes( 'deposit' ) ) return '💰 Deposits: Instant. Withdrawals: 1-24 hours.'
        return 'Thanks for your question! How can I help you?'
    }

    const handleKeyPress = ( e ) => { if ( e.key === 'Enter' && !e.shiftKey ) { e.preventDefault(); handleSendMessage() } }

    useEffect( () =>
    {
        const handleEscape = ( e ) => { if ( e.key === 'Escape' && isOpen ) handleClose() }
        document.addEventListener( 'keydown', handleEscape )
        return () => document.removeEventListener( 'keydown', handleEscape )
    }, [ isOpen, messages.length ] )

    if ( !isOpen ) return null

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 rounded-xl max-w-2xl w-full max-h-[80vh] flex flex-col shadow-2xl border border-white/10">
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-indigo-500 flex items-center justify-center">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="white" strokeWidth="2" /></svg>
                        </div>
                        <div><h3 className="font-semibold text-white">Onchainweb Support</h3><p className="text-xs text-green-400">● Online</p></div>
                    </div>
                    <button onClick={ handleClose } className="text-gray-400 hover:text-white" aria-label="Close">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" /></svg>
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    { messages.map( ( m ) => (
                        <div key={ m.id } className={ `flex ${ m.type === 'user' ? 'justify-end' : 'justify-start' }` }>
                            <div className={ `max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${ m.type === 'user' ? 'bg-gradient-to-r from-purple-600 to-indigo-500 text-white' : 'bg-white/10 text-gray-100' }` }>
                                <p className="text-sm">{ m.content }</p>
                                <p className="text-xs opacity-70 mt-1">{ m.timestamp.toLocaleTimeString( [], { hour: '2-digit', minute: '2-digit' } ) }</p>
                            </div>
                        </div>
                    ) ) }
                    { isTyping && <div className="flex justify-start"><div className="bg-white/10 px-4 py-2 rounded-lg"><div className="flex space-x-1"><div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div><div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={ { animationDelay: '0.1s' } }></div><div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={ { animationDelay: '0.2s' } }></div></div></div></div> }
                    <div ref={ messagesEndRef } />
                </div>
                <div className="p-4 border-t border-white/10">
                    <div className="flex gap-2">
                        <input ref={ inputRef } type="text" value={ inputMessage } onChange={ ( e ) => setInputMessage( e.target.value ) } onKeyDown={ handleKeyPress } placeholder="Type your message..." className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-400" disabled={ isTyping } />
                        <button onClick={ handleSendMessage } disabled={ !inputMessage.trim() || isTyping } className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-500 rounded-lg disabled:opacity-50" aria-label="Send">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="white" strokeWidth="2" /></svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
