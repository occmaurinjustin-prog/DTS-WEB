<?php

namespace App\Http\Controllers;

use App\Models\Client;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ClientController extends Controller
{
    public function index()
    {
        $clients = Client::orderBy('created_at', 'desc')->get();
        
        return Inertia::render('OperationalManager/Dashboard', [
            'clients' => $clients,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'client_name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'address' => 'required|string|max:500',
        ]);

        try {
            Client::create($validated);
            
            return redirect()->back()->with('success', 'Client created successfully.');
        } catch (\Exception $e) {
            return redirect()->back()
                ->withErrors(['error' => 'Failed to create client: ' . $e->getMessage()])
                ->withInput();
        }
    }

    public function update(Request $request, Client $client)
    {
        $validated = $request->validate([
            'client_name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'address' => 'required|string|max:500',
        ]);

        try {
            $client->update($validated);
            
            return redirect()->back()->with('success', 'Client updated successfully.');
        } catch (\Exception $e) {
            return redirect()->back()
                ->withErrors(['error' => 'Failed to update client: ' . $e->getMessage()])
                ->withInput();
        }
    }

    public function destroy(Client $client)
    {
        try {
            $client->delete();
            
            return redirect()->back()->with('success', 'Client deleted successfully.');
        } catch (\Exception $e) {
            return redirect()->back()
                ->withErrors(['error' => 'Failed to delete client: ' . $e->getMessage()]);
        }
    }
}
