'use client';

import React from 'react';
import { PrilogMData } from '../data/riskDataLoader';

interface PrilogMDetailsProps {
  data: PrilogMData;
  onClose: () => void;
}

export default function PrilogMDetails({ data, onClose }: PrilogMDetailsProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              📊 Detaljne kalkulacije - {data.id}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
            >
              ×
            </button>
          </div>

          <div className="space-y-6">
            {/* Osnovni podaci */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-bold text-blue-800 mb-2">📋 Osnovni podaci</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><strong>ID:</strong> {data.id}</div>
                <div><strong>Grupa:</strong> {data.groupId}</div>
                <div><strong>Zahtev:</strong> {data.requirement}</div>
              </div>
            </div>

            {/* Kalkulacije prema standardu */}
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-bold text-green-800 mb-4">🧮 Kalkulacije prema SRPS A.L2.003:2025</h3>
              
              {/* Kolona 4: Izloženost */}
              <div className="mb-4 p-3 bg-white rounded border">
                <h4 className="font-semibold text-gray-700 mb-2">Kolona 4: Izloženost (I)</h4>
                <div className="text-sm text-gray-800">
                  <p><strong>Formula:</strong> I = (Si + VO)/2</p>
                  <p><strong>Kalkulacija:</strong> I = (3 + {data.velicinaOpasnosti})/2 = {data.izlozenost}</p>
                  <p><strong>Objašnjenje:</strong> Si = stepen izloženosti (default 3), VO = veličina opasnosti</p>
                </div>
              </div>

              {/* Kolona 5: Ranjivost */}
              <div className="mb-4 p-3 bg-white rounded border">
                <h4 className="font-semibold text-gray-700 mb-2">Kolona 5: Ranjivost (R)</h4>
                <div className="text-sm text-gray-800">
                  <p><strong>Formula:</strong> R = (Sr + VO)/2</p>
                  <p><strong>Kalkulacija:</strong> R = (3 + {data.velicinaOpasnosti})/2 = {data.ranjivost}</p>
                  <p><strong>Objašnjenje:</strong> Sr = stepen ranjivosti (default 3), VO = veličina opasnosti</p>
                </div>
              </div>

              {/* Kolona 6: Verovatnoća */}
              <div className="mb-4 p-3 bg-white rounded border">
                <h4 className="font-semibold text-gray-700 mb-2">Kolona 6: Verovatnoća (V)</h4>
                <div className="text-sm text-gray-800">
                  <p><strong>Formula:</strong> V = I × R (iz matrice N.5)</p>
                  <p><strong>Kalkulacija:</strong> Ranjivost {data.ranjivost} × Izloženost {data.izlozenost} = {data.verovatnoca}</p>
                  <p><strong>Matrica:</strong> Prilog N, tabela N.5</p>
                </div>
              </div>

              {/* Kolona 8: Šteta */}
              <div className="mb-4 p-3 bg-white rounded border">
                <h4 className="font-semibold text-gray-700 mb-2">Kolona 8: Šteta (Š)</h4>
                <div className="text-sm text-gray-800">
                  <p><strong>Formula:</strong> Š = (SŠ + VMŠ)/2</p>
                  <p><strong>SŠ:</strong> Stvarna šteta (iz finansijskih podataka)</p>
                  <p><strong>VMŠ:</strong> Verovatno maksimalna šteta = SVnpoz × Ivo</p>
                  <p><strong>Ivo:</strong> Iud × Kvo (indeks uticaja delatnosti × koeficijent)</p>
                  <p><strong>Rezultat:</strong> {data.steta}</p>
                </div>
              </div>

              {/* Kolona 7: Posledice */}
              <div className="mb-4 p-3 bg-white rounded border">
                <h4 className="font-semibold text-gray-700 mb-2">Kolona 7: Posledice (P)</h4>
                <div className="text-sm text-gray-800">
                  <p><strong>Formula:</strong> P = Š × K (iz matrice Nj.3)</p>
                  <p><strong>Kalkulacija:</strong> Šteta {data.steta} × Kritičnost {data.kriticnost} = {data.posledice}</p>
                  <p><strong>Matrica:</strong> Prilog Nj, tabela Nj.3</p>
                </div>
              </div>

              {/* Kolona 10: Nivo rizika */}
              <div className="mb-4 p-3 bg-white rounded border">
                <h4 className="font-semibold text-gray-700 mb-2">Kolona 10: Nivo rizika (NR)</h4>
                <div className="text-sm text-gray-800">
                  <p><strong>Formula:</strong> NR = V × P (iz matrice O.2)</p>
                  <p><strong>Kalkulacija:</strong> Verovatnoća {data.verovatnoca} × Posledice {data.posledice} = {data.nivoRizika}</p>
                  <p><strong>Matrica:</strong> Prilog O, tabela O.2</p>
                </div>
              </div>
            </div>

            {/* Finalni rezultati */}
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="font-bold text-yellow-800 mb-4">🎯 Finalni rezultati</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-3 rounded border">
                  <h4 className="font-semibold text-gray-700 mb-2">Kategorija rizika</h4>
                  <div className={`inline-block px-3 py-1 rounded text-white font-bold ${
                    data.kategorijaRizika === 1 ? 'bg-red-700' :
                    data.kategorijaRizika === 2 ? 'bg-orange-600' :
                    data.kategorijaRizika === 3 ? 'bg-yellow-600' :
                    data.kategorijaRizika === 4 ? 'bg-blue-600' :
                    'bg-green-600'
                  }`}>
                    {data.kategorijaRizika === 1 ? 'PRVA (Izrazito veliki)' :
                     data.kategorijaRizika === 2 ? 'DRUGA (Veliki)' :
                     data.kategorijaRizika === 3 ? 'TREĆA (Umereno veliki)' :
                     data.kategorijaRizika === 4 ? 'ČETVRTA (Mali)' :
                     'PETA (Vrlo mali)'}
                  </div>
                  <p className="text-xs text-gray-700 mt-2">Prema Prilogu P, tabela P.1</p>
                </div>

                <div className="bg-white p-3 rounded border">
                  <h4 className="font-semibold text-gray-700 mb-2">Prihvatljivost</h4>
                  <div className={`inline-block px-3 py-1 rounded text-white font-bold ${
                    data.prihvatljivost === 'NEPRIHVATLJIV' ? 'bg-red-600' : 'bg-green-600'
                  }`}>
                    {data.prihvatljivost}
                  </div>
                  <p className="text-xs text-gray-700 mt-2">Prema Prilogu P, tabela P.2</p>
                </div>
              </div>
            </div>

            {/* Matrice reference */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-bold text-gray-800 mb-4">📚 Reference na standard</h3>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <strong>Matrica verovatnoće:</strong><br />
                  Prilog N, tabela N.5
                </div>
                <div>
                  <strong>Matrica posledica:</strong><br />
                  Prilog Nj, tabela Nj.3
                </div>
                <div>
                  <strong>Matrica nivo rizika:</strong><br />
                  Prilog O, tabela O.2
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={onClose}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg"
            >
              Zatvori
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}